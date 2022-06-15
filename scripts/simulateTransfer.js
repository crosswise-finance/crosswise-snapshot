const fs = require("fs")
const { utils } = require("ethers")
const { zeroAddress, attackTxHash } = require("./constants")
const { toLower } = require("./library")

require('dotenv').config()
require("colors")

/* User asset Data format
{
    address: "",
    assets: {
        crss-bnb: 100,
        ...
    },
    transactions: [
        {
            token: "",
            from: "",
            to: "",
            txHash: ""
        }
    ]
}
*
*/

const tokens = {
    CRSS_BNB: process.env.CRSS_BNB,
    CRSS_BUSD: process.env.CRSS_BUSD,
    CRSS_USDC: process.env.CRSS_USDC,
    BNB_BUSD: process.env.BNB_BUSD,
    USDT_BUSD: process.env.USDT_BUSD,
    BNB_ETH: process.env.BNB_ETH,
    BNB_BTCB: process.env.BNB_BTCB,
    BNB_CAKE: process.env.BNB_CAKE,
    BNB_ADA: process.env.BNB_ADA,
    BNB_DOT: process.env.BNB_DOT,
    BNB_LINK: process.env.BNB_LINK,
    CRSS: process.env.CRSSV11,
    XCRSS: process.env.XCRSS,
}

const main = () => {
    const transferPath = "./_snapshot/transfer/orderedTransfers.json"
    const transactionPath = "./_snapshot/transactions/orderedTx.json"

    let transfers = fs.readFileSync(transferPath, 'utf-8')
    transfers = JSON.parse(transfers)
    console.log("Total Transfers: ".yellow, transfers.length)

    let txs = fs.readFileSync(transactionPath, 'utf-8')
    txs = JSON.parse(txs)
    console.log("Total Transactions: ".yellow, txs.length)

    // Get Snapshot of assets in users' wallet
    // const users = snapShotWallet(transfers)
    // console.log("Total Users: ", users.length)

    // Get Snapshot of assets deposited in masterchef contract
    snapshotMasterchef(txs, transfers)

}

const snapshotMasterchef = (txs, transfers) => {
    let state = "beforeAttack"
    const savePath = "./_snapshot/user_assets/"

    // Loop through transactions and pick transactions that manipulate balances in masterchef
    const txType = ["deposit", "withdraw", "emergencyWithdraw"]
    const depositType = ["deposit", "enterStaking"]

    const masterchefTx = txs.filter((tx) => txType.indexOf(tx.Method) >= 0 && tx.ErrCode === "")

    console.log("masterchefTx: ", masterchefTx.length)
    console.log("deposit: ", masterchefTx.filter((tx) => tx.Method == "deposit").length)
    console.log("withdraw: ", masterchefTx.filter((tx) => tx.Method == "withdraw").length)
    console.log("emergencyWithdraw: ", masterchefTx.filter((tx) => tx.Method == "emergencyWithdraw").length)

    let users = []

    for (let i = 0; i < masterchefTx.length; i++) {

        const txHash = masterchefTx[i].Txhash
        const caller = toLower(masterchefTx[i].From)
        const method = masterchefTx[i].Method

        // Pick out main transfer that delievered token to masterchef addressconst txHash = transfers[i].transactionHash
        console.log(`Transaction ${i}: ${txHash}`)
        if (txHash === attackTxHash && state === 'beforeAttack') {
            fs.writeFileSync(`${savePath}${state}_masterchef.json`, JSON.stringify(convertUserInfoToReadable(users)))
            state = "afterAttack"
            convertUserInfoToBignum(users)
        } else if (txHash != attackTxHash && state === 'afterAttack') {
            fs.writeFileSync(`${savePath}${state}_masterchef.json`, JSON.stringify(convertUserInfoToReadable(users)))
            state = "current"
            convertUserInfoToBignum(users)
        } else if (i === transfers.length - 1) {
            fs.writeFileSync(`${savePath}${state}_masterchef.json`, JSON.stringify(convertUserInfoToReadable(users)))
            convertUserInfoToBignum(users)
        }

        const transfer = transfers.filter((transfer) => {
            if (transfer.transactionHash !== txHash) return false

            const from = toLower(transfer.args[0])
            const to = toLower(transfer.args[1])
            const token = toLower(transfer.address)

            // If this is a Crss token transfer, it is just crss reward
            if (token === toLower(process.env.CRSSV11) || token === toLower(process.env.XCRSS)) return false

            // When user deposit or enterstaking, tokne transfers from user address to masterchef address
            if (depositType.indexOf(method) >= 0 && caller === from) return true
            else if (depositType.indexOf(method) < 0 && caller === to) return true
            else return false
        })
        if (transfer.length == 0) {
            console.log("No Deposit".red, txHash, caller, method)
            // If no deposit registered
            continue;
            // throw (Error("No transfer was occured"))
        } else if (transfer.length > 1) {
            console.log("Double Deposit".red, txHash, transfer)
            throw (Error("Duble Deposit happended in one transaction"))
        }

        const direction = method === 'deposit' ? 1 : 0
        const amount = utils.parseEther(utils.formatEther(transfer[0].args[2].hex))
        moveToken(caller, getTokenName(transfer[0].address), amount, direction, txHash, users)
    }

    return users
}

/**
 * 
 * @param {transfers Event Hisotry} transfers 
 */

const snapShotWallet = (transfers) => {
    let state = "beforeAttack"
    const savePath = "./_snapshot/user_assets/"

    let users = [];

    for (let i = 0; i < transfers.length; i++) {

        // Take Snapshot at 3 different point - Before attack, after attack, current
        const txHash = transfers[i].transactionHash
        console.log(`Transaction ${i}: ${txHash}, ${utils.formatEther(transfers[i].args[2].hex)}`)

        if (txHash === attackTxHash && state === 'beforeAttack') {
            fs.writeFileSync(`${savePath}${state}.json`, JSON.stringify(convertUserInfoToReadable(users)))
            state = "afterAttack"
            convertUserInfoToBignum(users)
        } else if (txHash != attackTxHash && state === 'afterAttack') {
            fs.writeFileSync(`${savePath}${state}.json`, JSON.stringify(convertUserInfoToReadable(users)))
            state = "current"
            convertUserInfoToBignum(users)
        } else if (i === transfers.length - 1) {
            fs.writeFileSync(`${savePath}${state}.json`, JSON.stringify(convertUserInfoToReadable(users)))
            convertUserInfoToBignum(users)
        }

        const tokenAddr = transfers[i].address
        const tokenName = getTokenName(tokenAddr)


        const sender = transfers[i].args[0]
        const receiver = transfers[i].args[1]
        const amount = utils.parseEther(utils.formatEther(transfers[i].args[2].hex))

        // If moved amount is Zero, skip out
        if (Number(utils.formatEther(amount)) === 0) {
            console.log("Moved 0 ", tokenName, txHash)
            continue
        }

        // Calculate Assets balance on individual wallet
        if (sender !== zeroAddress) {
            moveToken(sender, tokenName, amount, 0, txHash, users)
        }
        if (receiver !== zeroAddress) {
            moveToken(receiver, tokenName, amount, 1, txHash, users)
        }
    }

    return users
}

/**
 * 
 * @param {users list of users to format token balances to readable one} users 
 * @returns readable balance of user assets
 */
const convertUserInfoToReadable = (users) => {
    const tokenNames = Object.keys(tokens)
    return users.map((user) => {
        tokenNames.forEach((token) => {
            user.assets[token] = user.assets[token] ? utils.formatEther(user.assets[token]) : 0
        })
        return user
    })
}

/**
 * 
 * @param {users list of users to format token balances to readable one} users 
 * @returns readable balance of user assets
 */
const convertUserInfoToBignum = (users) => {
    const tokenNames = Object.keys(tokens)
    return users.map((user) => {
        tokenNames.forEach((token) => {
            user.assets[token] = user.assets[token] ? utils.parseEther(user.assets[token]) : utils.parseEther("0")
        })
        return user
    })
}

const moveToken = (address, token, amount, direction, txHash, users) => {
    const index = users.map(u => u.address).indexOf(address)

    // If this address is not registered in the users list, then create a new one and save
    if (index < 0) {
        // If new address tries to send token, throw error, since it has no balance to send to other address
        if (direction === 0) {
            console.log("set", address, token, amount, direction, txHash)
            throw (Error("Not registered User"));
        }
        const user = {
            address: address,
            assets: {
                [token]: amount
            },
            transactions: [{
                from: 0,
                to: utils.formatEther(amount),
                token: token,
                txHash: txHash
            }]
        }
        users.push(user)
        return users
    }

    const user = users[index]
    const prevBal = user.assets[token] || utils.parseEther("0")
    if ((prevBal).lt(amount) && direction === 0) {
        console.log("Move Token", txHash, amount, prevBal, user.transactions)
        throw (Error("Not enough amount to transfer"))
    }

    const newBal = direction === 0 ? prevBal.sub(amount) : prevBal.add(amount)
    user.assets[token] = newBal
    user.transactions.push({
        from: utils.formatEther(prevBal),
        to: utils.formatEther(newBal),
        token: token,
        txHash: txHash
    })
    users[index] = user

    return users
}

const getTokenName = (addr) => {
    const tokenNames = Object.keys(tokens)
    const tokenAddrs = Object.values(tokens)
    const index = tokenAddrs.indexOf(addr)
    return tokenNames[index]
}

main()