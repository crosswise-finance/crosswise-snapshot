const fs = require("fs")
const ethers = require("ethers")
const { attackTxHash4 } = require("../scripts/constants")
const { utils } = require("ethers")

const CrssBnb = "0xb5d85cA38a9CbE63156a02650884D92A6e736DDC".toLowerCase() // Crss-bnb
const CrssBusd = "0xB9B09264779733B8657b9B86970E3DB74561c237".toLowerCase() // Crss-busd
const CrssUsdt = "0x21d398F619a7A97e0CAb6443fd76Ef702B6dCE8D".toLowerCase() // Crss-usdt

const PCSCrssBnb = "0x9cbed1220E01F457772cEe3AAd8B94A142fc975F".toLowerCase() // Pancake Crss-BNB LP
const PCSCrssBusd = "0x4ad41fB0F62cDCb5F81B7741554169Daf822ac67".toLowerCase() // Pancake Crss-BUSD LP

const BSCrssBnb = "0x73C02124d38538146aE2D807a3F119A0fAd3209c".toLowerCase() // Biswap Crss-BNB LP

const CRSS = "0x99FEFBC5cA74cc740395D65D384EDD52Cb3088Bb".toLowerCase() // Crss token

const transferHash = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"

const crssPools = [CrssBnb, CrssBusd, CrssUsdt, PCSCrssBnb, PCSCrssBusd, BSCrssBnb]
const bnbPools = [CrssBnb, PCSCrssBnb, BSCrssBnb]
const busdPools = [CrssBusd, PCSCrssBusd]
const usdtPools = [CrssUsdt]

const main = async () => {
    let transfers = fs.readFileSync("./_snapshot/transfer/orderedTransfers.json")
    transfers = JSON.parse(transfers)

    let txs = fs.readFileSync("./_snapshot/transactions/orderedTx.json")
    txs = JSON.parse(txs)

    const lastAttackIndex = transfers.map(t => t.transactionHash).lastIndexOf(attackTxHash4)

    // Slice transfers after the last attack and filter only those reacted with crss pools
    const transfersAfter = transfers.slice(lastAttackIndex + 1).filter(t => {
        const fromPool = crssPools.indexOf(t.args[0].toLowerCase()) >= 0
        const isCrss = t.address.toLowerCase() === CRSS
        if (fromPool && isCrss) return true
        else return false
    })

    console.log("Total: ", transfersAfter.length)
    const bnbTxs = []
    const busdTxs = []
    const usdtTxs = []

    transfersAfter.forEach(t => {
        const txHash = t.transactionHash
        const pool = t.args[0].toLowerCase()
        if (bnbPools.indexOf(pool) >= 0 && bnbTxs.indexOf(txHash) < 0) {
            bnbTxs.push(txHash)
        } else if (busdPools.indexOf(pool) >= 0 && busdTxs.indexOf(txHash) < 0) {
            busdTxs.push(txHash)
        } else if (usdtPools.indexOf(pool) >= 0 && usdtTxs.indexOf(txHash) < 0) {
            usdtTxs.push(txHash)
        }
    })

    // await getTokenMovement(txs)
    fs.writeFileSync(`./_snapshot/report/dipbuy/bnbTx.json`, JSON.stringify(bnbTxs))
    fs.writeFileSync(`./_snapshot/report/dipbuy/busdTx.json`, JSON.stringify(busdTxs))
    fs.writeFileSync(`./_snapshot/report/dipbuy/usdtTx.json`, JSON.stringify(usdtTxs))

    await getBNBMovement(bnbTxs, transfersAfter)

    console.log("Total: ", bnbTxs.length + busdTxs.length + usdtTxs.length, `BNB: ${bnbTxs.length}, BUSD: ${busdTxs.length}, USDT: ${usdtTxs.length}`)
}

const getTokenMovement = async (txs) => {
    const rpcProvider = "https://bsc-dataseed1.defibit.io/";
    const provider = new ethers.providers.JsonRpcProvider(rpcProvider);

    fs.writeFileSync("bnbDipBuyers.json", "[")
    for (let i = 0; i < txs.length; i++) {
        console.log("Tx: ", txs[i])
        const data = await provider.getTransaction(txs[i])

        console.log(data)
        const logs = data.logs.filter(log => log.topics[0] === transferHash)
        const caller = data.from
        const to = data.to

        if (crssPools.indexOf(to) < 0) {
            console.log("Not a pool action: ", to)
            continue
        }

        const crssTransfer = logs.forEach(log => {
            const token = log.address
            const amount = utils.formatEther()
        })
        console.log(transfers, transfers.length)
    }
}

const getBNBMovement = async (txs, transfersAfter) => {
    const rpcProvider = "https://bsc-dataseed1.defibit.io/";
    const provider = new ethers.providers.JsonRpcProvider(rpcProvider);

    const dipBuyers = []

    let totalBNB = 0
    let totalCrss = 0

    fs.writeFileSync("bnbDipBuyers.json", "[")
    // for (let i = 0; i < txs.length; i++) {
    for (let i = 500; i < 505; i++) {
        // const tx = txs[i]
        const tx = "0xf19e321ddd422a2ed5723e3576a2cd06e46354c09ccb2ddd6b1bdc119c34b1be"
        console.log("Tx: ", tx, i)
        const data = await provider.getTransaction(tx)

        const caller = data.from
        const bnb = Number(utils.formatEther(data.value))
        if (bnb === 0) {
            console.log('Zero bnb sent')
            continue
        }
        let crss = 0
        let transfers = transfersAfter.filter(t => tx === t.transactionHash)

        console.log(transfers)
        transfers = transfers.filter(t => {
            console.log(t.args)
            const fromPool = bnbPools.indexOf(t.args[0].toLowerCase()) >= 0
            const isCrss = t.address.toLowerCase() === CRSS
            const toCaller = t.args[1].toLowerCase() === caller.toLowerCase()

            if (fromPool && isCrss && toCaller) {
                crss += Number(utils.formatEther(t.args[2]))
                return true
            } else return false
        })
        console.log(transfers)

        console.log("BNB: ", bnb, "CRSS: ", crss)

        if (transfers.length === 0 || crss === 0) {
            console.log("Zero Crss minted")
            continue
        }

        totalBNB += bnb
        totalCrss += crss
        console.log("Total: ", totalBNB, totalCrss)

        dipBuyers.push({
            account: caller,
            amount: crss,
            bnb: bnb,
            txHash: tx
        })
    }

    fs.writeFileSync("./_snapshot/report/dipBuy/bnbSeller.json", JSON.stringify(dipBuyers))

}

main()