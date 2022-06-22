const fs = require("fs")
const { utils } = require("ethers")
const { zeroAddress, attackTxHash1, attackTxHash4, lastFarmTxBeforeExploit, firstFarmTxAfterExploit, devWallet } = require("./constants")
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
    CRSS_USDT: process.env.CRSS_USDT,
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

const pools = [
    process.env.CRSSV11,
    process.env.CRSS_BNB,
    process.env.CRSS_BUSD,
    process.env.BNB_BUSD,
    process.env.USDT_BUSD,
    process.env.BNB_ETH,
    process.env.BNB_BTCB,
    process.env.BNB_CAKE,
    process.env.BNB_ADA,
    process.env.BNB_DOT,
    process.env.BNB_LINK
]

const totalShare = []
const totalLock = []

const main = () => {
    const transferPath = "./_snapshot/transfer/orderedTransfers.json"
    const transactionPath = "./_snapshot/transactions/orderedTx.json"
    const msTxPath = "./_snapshot/transactions/masterchefTxWithParams.json"

    let transfers = fs.readFileSync(transferPath, 'utf-8')
    transfers = JSON.parse(transfers)
    console.log("Total Transfers: ".yellow, transfers.length)

    let txs = fs.readFileSync(transactionPath, 'utf-8')
    txs = JSON.parse(txs)
    console.log("Total Transactions: ".yellow, txs.length)

    // Get Snapshot of assets in users' wallet
    const users = snapShotWallet(transfers)
    console.log("Total Users: ", users.length)

    let msTxs = fs.readFileSync(msTxPath, 'utf-8')
    msTxs = JSON.parse(msTxs)
    console.log("Total Masterchef Transactions: ".yellow, msTxs.length)

    // Get Snapshot of assets deposited in masterchef contract
    snapshotMasterchef(msTxs, transfers)

}

const snapshotMasterchef = (txs, transfers) => {
    let state = "beforeAttack"

    const savePath = "./_snapshot/user_assets/"

    const minusAmount = []
    // Loop through transactions and pick transactions that manipulate balances in masterchef
    const txType = ["deposit", "withdraw", "emergencyWithdraw", "earn"]
    const depositType = ["deposit"]

    // Prepare total share and total locked value for simulate deposit and withdraw as contract does
    for (let i = 0; i < pools.length; i++) {
        totalShare.push(utils.parseEther("0"))
        totalLock.push(utils.parseEther("0"))
    }

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
        const pid = Number(masterchefTx[i].params[0].hex)

        // Pick out main transfer that delievered token to masterchef addressconst txHash = transfers[i].transactionHash
        console.log(`Transaction ${i}: ${txHash}`)
        if (txHash === lastFarmTxBeforeExploit) {
            fs.writeFileSync(`${savePath}${state}_masterchef.json`, JSON.stringify(convertUserInfoToReadable(users)))
            state = "afterAttack"
            convertUserInfoToBignum(users)
        } else if (state === 'afterAttack' && txHash === firstFarmTxAfterExploit) {
            fs.writeFileSync(`${savePath}${state}_masterchef.json`, JSON.stringify(convertUserInfoToReadable(users)))
            convertUserInfoToBignum(users)
            state = "current"
        }
        else if (i === masterchefTx.length - 1) {
            console.log("Ended: ", i === masterchefTx.length, i, masterchefTx.length)
            fs.writeFileSync(`${savePath}${state}_masterchef.json`, JSON.stringify(convertUserInfoToReadable(users)))
            convertUserInfoToBignum(users)
        }

        if (method === 'earn') {
            earn(txHash, pid, transfers)
            continue
        }

        let requestAmount
        if (method !== 'emergencyWithdraw') {
            requestAmount = Number(utils.formatEther(masterchefTx[i].params[1].hex))

            if (requestAmount === 0) {
                console.log("Requested zero amount")
                continue
            }

        }

        let transfer = transfers.filter((transfer) => {
            if (transfer.transactionHash !== txHash) return false

            const from = toLower(transfer.args[0])
            const to = toLower(transfer.args[1])
            const token = toLower(transfer.address)

            // If this is a Crss token transfer, it is just crss reward
            if ((pid !== 0 && token === toLower(process.env.CRSSV11)) || token === toLower(process.env.XCRSS)) return false

            // When user deposit or enterstaking, tokne transfers from user address to masterchef address
            if (depositType.indexOf(method) >= 0 && caller === from) return true
            else if (depositType.indexOf(method) < 0 && caller === to) return true
            else return false
        })
        if (transfer.length == 0) {
            // If no deposit registered
            continue;
            // throw (Error("No transfer was occured"))
        } else if (transfer.length > 1) {
            if (toLower(transfer[0].address) === toLower(process.env.CRSSV11)) transfer = transfer.slice(-1)
            else {
                console.log("Double Deposit".red, txHash, transfer)
                throw (Error("Duble Deposit happended in one transaction"))
            }
        }

        const direction = method === 'deposit' ? 1 : 0
        const amount = utils.parseEther(utils.formatEther(transfer[0].args[2].hex))
        const tokenName = getTokenName(transfer[0].address)

        // If moved amount is Zero, skip out
        if (toNum(amount) === 0) {
            console.log("Moved 0 ", tokenName, txHash)
            continue
        }

        if (method === 'deposit') {

            let index = users.map(u => u.address).indexOf(caller)

            if (index < 0) {
                const user = {
                    address: caller,
                    assets: {},
                    transactions: []
                }
                users.push(user)
                index = users.length - 1
            }

            // User deposit action
            if (masterchefTx[i].params[4]) {

                // If user select auto compound on, register auto compound pool to this user and manipulate total share and lock
                if (users[index].autoPool && users[index].autoPool.indexOf(pid) < 0) {
                    users[index].autoPool.push(pid)
                } else if (!users[index].autoPool) {
                    users[index].autoPool = [pid]
                }

                let share = amount
                if (toNum(totalLock[pid]) > 0) {
                    share = amount.mul(totalShare[pid]).div(totalLock[pid])
                    if (toNum(share) == 0 && toNum(totalShare[pid]) == 0)
                        share = amount.div(totalLock[pid])
                }
                totalShare[pid] = totalShare[pid].add(share)
                totalLock[pid] = totalLock[pid].add(amount)
                moveToken(caller, tokenName, share, direction, txHash, users)
            } else
                moveToken(caller, tokenName, amount, direction, txHash, users)

        } else if (method === 'withdraw') {
            const index = users.map(u => u.address).indexOf(caller)
            const userAmount = users[index].assets[tokenName]

            // When user withdraw
            // let lockedAmount, shareRemoved
            // const isAuto = users[index].autoPool && users[index].autoPool.indexOf(pid) >= 0

            // if (isAuto) {
            //     lockedAmount = userAmount.mul(totalLock[pid]).div(totalShare[pid])
            //     shareRemoved = amount.mul(totalShare[pid]).div(totalLock[pid])

            //     if (lockedAmount.eq(userAmount)) users[index].assets[tokenName] = utils.parseEther("0")

            //     totalShare[pid] = totalShare[pid].sub(shareRemoved)
            //     totalLock[pid] = totalLock[pid].sub(amount)
            // } else {
            //     lockedAmount = userAmount
            //     shareRemoved = amount
            // }
            // // console.log(users[index], tokenName)
            // if (userAmount.lt(shareRemoved)) {
            // const minus = Number(utils.formatEther(shareRemoved.sub(userAmount)))
            // minusAmount[tokenName] = minusAmount[tokenName] ? minusAmount[tokenName] + minus : minus

            //     users[index].assets[tokenName] = utils.parseEther("0")
            //     // if (toLower(transfer[0].address) === toLower(process.env.CRSSV11)) {
            //     //     continue
            //     // } else {
            //     //     console.log(isAuto, users[index], txHash, requestAmount, utils.formatEther(shareRemoved), totalShare[pid], totalLock[pid])
            //     //     throw (Error("Not enough LP"))
            //     // }
            // } else
            // if (txHash == "0x2638f48b5c99f66322ecf10cdc4ee39ca43d023d9a65226cbe1513ecdd02940f") {
            //     console.log(utils.formatEther(users[index].assets[tokenName]), utils.formatEther(amount), users[index].assets[tokenName].lt(amount))
            // }
            if (users[index].assets[tokenName].lt(amount)) {
                users[index].assets[tokenName] = utils.parseEther("0")

                const minus = Number(utils.formatEther(amount.sub(userAmount)))
                minusAmount[tokenName] = minusAmount[tokenName] ? minusAmount[tokenName] + minus : minus
            }
            else users[index].assets[tokenName] = userAmount.sub(amount)

            // if (txHash == "0x2638f48b5c99f66322ecf10cdc4ee39ca43d023d9a65226cbe1513ecdd02940f") {
            //     console.log(utils.formatEther(users[index].assets[tokenName]), utils.formatEther(amount))
            // break
            // }
            // if (Number(utils.formatEther(users[index].assets[tokenName])) == 0 && isAuto) {
            //     autoPool = users[index].autoPool.splice(users[index].autoPool.indexOf(pid), 1)
            // }

            users[index].transactions.push({
                from: utils.formatEther(userAmount), token: tokenName, to: utils.formatEther(users[index].assets[tokenName]), txHash
            })
        } else {
            const index = users.map(u => u.address).indexOf(caller)
            const userAmount = users[index].assets[tokenName]
            const isAuto = users[index].autoPool && users[index].autoPool.indexOf(pid) >= 0
            if (isAuto) {
                const amount = userAmount.mul(totalLock[pid]).div(totalShare[pid])
                totalShare[pid] = totalShare[pid].sub(userAmount)
                totalLock[pid] = totalLock[pid].sub(amount)
            }
            users[index].assets[tokenName] = utils.parseEther("0")

            users[index].transactions.push({
                from: utils.formatEther(userAmount), token: tokenName, to: utils.parseEther("0"), txHash
            })
        }
    }
    console.log(minusAmount)
    return users
}

const earn = (tx, pid, transfers) => {
    // Get token Address of issued pool id
    const token = pools[pid]

    // Capture main transfer that mints LP token as auto compounding
    const transfer = transfers.filter((transfer) => transfer.transactionHash === tx && transfer.address === token)
    if (transfer.length === 0) return

    const amount = utils.parseEther(utils.formatEther(transfer[0].args[2]))
    totalLock[pid] = totalLock[pid].add(amount)
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

        if (txHash === attackTxHash1 && state === 'beforeAttack') {
            fs.writeFileSync(`${savePath}${state}.json`, JSON.stringify(convertUserInfoToReadable(users)))
            convertUserInfoToBignum(users)
            state = "enterAttack"
        } else if (txHash === attackTxHash4 && state === "enterAttack") {
            state = "afterAttack"
        } else if (txHash != attackTxHash4 && state === 'afterAttack') {
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
        if (toNum(amount) === 0) {
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

const toNum = (bigNum) => {
    return Number(utils.formatEther(bigNum))
}

main()