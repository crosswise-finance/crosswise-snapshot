const fs = require("fs")
const ethers = require("ethers")
const { attackTxHash4 } = require("./constants")
const { utils } = require("ethers")

const CrssBnb = "0xb5d85cA38a9CbE63156a02650884D92A6e736DDC".toLowerCase() // Crss-bnb
const CrssBusd = "0xB9B09264779733B8657b9B86970E3DB74561c237".toLowerCase() // Crss-busd
const CrssUsdt = "0x21d398F619a7A97e0CAb6443fd76Ef702B6dCE8D".toLowerCase() // Crss-usdt

const PCSCrssBnb = "0x9cbed1220E01F457772cEe3AAd8B94A142fc975F".toLowerCase() // Pancake Crss-BNB LP
const PCSCrssBusd = "0x4ad41fB0F62cDCb5F81B7741554169Daf822ac67".toLowerCase() // Pancake Crss-BUSD LP

const BSCrssBnb = "0x73C02124d38538146aE2D807a3F119A0fAd3209c".toLowerCase() // Biswap Crss-BNB LP

const CRSS = "0x99FEFBC5cA74cc740395D65D384EDD52Cb3088Bb".toLowerCase() // Crss token
const BUSD = "0xe9e7cea3dedca5984780bafc599bd69add087d56".toLowerCase()
const USDT = "0x55d398326f99059ff775485246999027b3197955".toLowerCase()
const WBNB = "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c".toLowerCase()

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
        const toPool = crssPools.indexOf(t.args[1].toLowerCase()) >= 0
        const isCrss = t.address.toLowerCase() === CRSS
        if (toPool && isCrss) return true
        else return false
    })

    console.log("Total: ", transfersAfter.length)
    // const bnbTxs = []
    // const busdTxs = []
    // const usdtTxs = []
    const swapTxs = []

    transfersAfter.forEach(t => {
        const txHash = t.transactionHash
        const pool = t.args[1].toLowerCase()
        // if (bnbPools.indexOf(pool) >= 0 && bnbTxs.indexOf(txHash) < 0) {
        //     bnbTxs.push(txHash)
        // } else if (busdPools.indexOf(pool) >= 0 && busdTxs.indexOf(txHash) < 0) {
        //     busdTxs.push(txHash)
        // } else if (usdtPools.indexOf(pool) >= 0 && usdtTxs.indexOf(txHash) < 0) {
        //     usdtTxs.push(txHash)
        // }
        if (swapTxs.indexOf(txHash) < 0)
            swapTxs.push(txHash)
    })

    console.log("Swap Txs: ", swapTxs.length)
    // console.log("BNB txs: ", bnbTxs.length)
    // console.log("busdTxs txs: ", busdTxs.length)
    // console.log("usdtTxs txs: ", usdtTxs.length)

    fs.writeFileSync(`./_snapshot/report/dipSell/swapTxs.json`, JSON.stringify(swapTxs))
    // fs.writeFileSync(`./_snapshot/report/dipSell/bnbTx.json`, JSON.stringify(bnbTxs))
    // fs.writeFileSync(`./_snapshot/report/dipSell/busdTx.json`, JSON.stringify(busdTxs))
    // fs.writeFileSync(`./_snapshot/report/dipSell/usdtTx.json`, JSON.stringify(usdtTxs))
    downTxInfo(swapTxs)

    // await getMovement(swapTxs, transfersAfter)
    // await getBUDSMovement(swapTxs, transfersAfter)
    // await getUSDTMovement(usdtTxs, transfersAfter)

    // analysisDip('./_snapshot/report/dipSell/bnbSeller', true)
    // analysisDip('./_snapshot/report/dipSell/busdSeller')
    // analysisDip('./_snapshot/report/dipSell/usdtSeller')
    console.log("Total: ", swapTxs.length)
    // console.log("Total: ", bnbTxs.length + busdTxs.length + usdtTxs.length, `BNB: ${bnbTxs.length}, BUSD: ${busdTxs.length}, USDT: ${usdtTxs.length}`)
}

const downTxInfo = async (txs) => {
    const txInfo = []
    const rpcProvider = "https://bsc-dataseed1.defibit.io/";
    const provider = new ethers.providers.JsonRpcProvider(rpcProvider);
    // for (let i = 0; i < 2; i++) {
    for (let i = 0; i < txs.length; i++) {
        const tx = txs[i]
        console.log("Tx: ", tx, i)
        const data = await provider.getTransactionReceipt(tx)
        txInfo.push(data)
    }

    fs.writeFileSync(`./_snapshot/report/dipSell/swapTxInfo.json`, JSON.stringify(txInfo))

}

const getBUDSMovement = async (txs, transfersAfter) => {
    const rpcProvider = "https://bsc-dataseed1.defibit.io/";
    const provider = new ethers.providers.JsonRpcProvider(rpcProvider);

    const dipSellers = []

    let totalBusd = 0
    let totalCrss = 0

    for (let i = 0; i < txs.length; i++) {
        const tx = txs[i]
        // if (txs[i] != "0x788aff5fa0cf11b68e2b880132e5629af4bc2e06781e56beb24518b2d1937921") continue
        console.log("Tx: ", tx, i)
        const data = await provider.getTransactionReceipt(tx)

        const logs = data.logs.filter(log => log.topics[0] === transferHash)
        const tokenTransfers = logs.map(log => ({
            from: `0x${log.topics[1].slice(26)}`,
            to: `0x${log.topics[2].slice(26)}`,
            amount: utils.formatEther(log.data),
            token: log.address
        }))
        const caller = data.from
        const to = data.to

        let busd = 0
        let crss = 0
        let transfers = transfersAfter.filter(t => tx === t.transactionHash)

        // Calculate crss token input throughout transaction
        transfers = transfers.filter(t => {
            const fromPool = [...busdPools, ...bnbPools, ...usdtPools].indexOf(t.args[1].toLowerCase()) >= 0
            const isCrss = t.address.toLowerCase() === CRSS
            const fromCaller = t.args[0].toLowerCase() === caller.toLowerCase()

            if (fromPool && isCrss && fromCaller) {
                crss += Number(utils.formatEther(t.args[2]))
                return true
            } else return false
        })


        if (transfers.length === 0 || crss === 0) {
            console.log("Zero Crss minted")
            continue
        }

        // Calculate Busd token output
        transfers = tokenTransfers.filter(t => {
            // const fromPool = busdPools.indexOf(t.from.toLowerCase()) >= 0
            const isBusd = t.token.toLowerCase() === BUSD
            const toCaller = t.to.toLowerCase() === caller.toLowerCase()
            if (isBusd && toCaller) {
                busd += Number(t.amount)
                return true
            } else return false
        })

        if (transfers.length === 0 || busd === 0) {
            console.log("Zero BUSD sent")
            continue
        }
        console.log("Busd: ", busd, "CRSS: ", crss)

        totalBusd += busd
        totalCrss += crss
        console.log("Total: ", totalBusd, totalCrss)

        dipSellers.push({
            account: caller,
            amount: crss,
            sold: busd,
            txHash: tx
        })
    }
    fs.writeFileSync("./_snapshot/report/dipSell/busdSeller.json", JSON.stringify(dipSellers))
}
const getUSDTMovement = async (txs, transfersAfter) => {
    const rpcProvider = "https://bsc-dataseed1.defibit.io/";
    const provider = new ethers.providers.JsonRpcProvider(rpcProvider);

    const dipSellers = []

    let totalUsdt = 0
    let totalCrss = 0

    for (let i = 0; i < txs.length; i++) {
        const tx = txs[i]
        console.log("Tx: ", txs[i], i)
        const data = await provider.getTransactionReceipt(txs[i])

        const logs = data.logs.filter(log => log.topics[0] === transferHash)
        const tokenTransfers = logs.map(log => ({
            from: `0x${log.topics[1].slice(26)}`,
            to: `0x${log.topics[2].slice(26)}`,
            amount: utils.formatEther(log.data),
            token: log.address
        }))
        const caller = data.from
        const to = data.to

        let usdt = 0
        let crss = 0
        let transfers = transfersAfter.filter(t => tx === t.transactionHash)

        // Calculate crss token output throughout transaction
        transfers = transfers.filter(t => {
            const fromPool = [...busdPools, ...bnbPools, ...usdtPools].indexOf(t.args[1].toLowerCase()) >= 0
            const isCrss = t.address.toLowerCase() === CRSS
            const toCaller = t.args[0].toLowerCase() === caller.toLowerCase()

            if (isCrss && toCaller) {
                crss += Number(utils.formatEther(t.args[2]))
                return true
            } else return false
        })


        if (transfers.length === 0 || crss === 0) {
            console.log("Zero Crss minted")
            continue
        }

        // Calculate Busd token output
        transfers = tokenTransfers.filter(t => {
            // const fromPool = usdtPools.indexOf(t.from.toLowerCase()) >= 0
            const isUsdt = t.token.toLowerCase() === USDT
            const toCaller = t.to.toLowerCase() === caller.toLowerCase()
            if (fromPool && isUsdt && toCaller) {
                usdt += Number(t.amount)
                return true
            } else return false
        })

        if (transfers.length === 0 || usdt === 0) {
            console.log("Zero usdt sent")
            continue
        }
        console.log("USDT: ", usdt, "CRSS: ", crss)
        totalUsdt += usdt
        totalCrss += crss
        console.log("Total: ", totalUsdt, totalCrss)

        dipSellers.push({
            account: caller,
            amount: crss,
            sold: usdt,
            txHash: tx
        })
    }
    fs.writeFileSync("./_snapshot/report/dipSell/usdtSeller.json", JSON.stringify(dipSellers))
}

const getMovement = async (txs, transfersAfter) => {
    const rpcProvider = "https://bsc-dataseed1.defibit.io/";
    const provider = new ethers.providers.JsonRpcProvider(rpcProvider);

    const dipSellers = []

    let totalBnb = 0
    let totalBusd = 0
    let totalUsdt = 0
    let totalCrss = 0

    for (let i = 0; i < txs.length; i++) {
        const tx = txs[i]
        if (txs[i] != "0x788aff5fa0cf11b68e2b880132e5629af4bc2e06781e56beb24518b2d1937921") continue
        // const data = await provider.getTransactionReceipt("0x211de84281497338556e0e5d55571d478a40cab92e9f4acd00976d2a27dcc81f")
        console.log("Tx: ", txs[i], i)
        const data = await provider.getTransactionReceipt(txs[i])

        const logs = data.logs.filter(log => log.topics[0] === transferHash)
        const tokenTransfers = logs.map(log => ({
            from: `0x${log.topics[1].slice(26)}`,
            to: `0x${log.topics[2].slice(26)}`,
            amount: utils.formatEther(log.data),
            token: log.address
        }))
        const caller = data.from
        const to = data.to

        let bnb = 0
        let busd = 0
        let usdt = 0
        let crss = 0
        let transfers = transfersAfter.filter(t => tx === t.transactionHash)

        // Calculate Csss token inputt throughout transaction
        transfers = transfers.filter(t => {
            const toPool = [...busdPools, ...bnbPools, ...usdtPools].indexOf(t.args[1].toLowerCase()) >= 0
            const isCrss = t.address.toLowerCase() === CRSS
            const fromCaller = t.args[0].toLowerCase() === caller.toLowerCase()

            if (toPool && isCrss && fromCaller) {
                crss += Number(utils.formatEther(t.args[2]))
                return true
            } else return false
        })


        if (transfers.length === 0 || crss === 0) {
            console.log("Zero Crss minted")
            continue
        }

        // Calculate BNB token output
        transfers = tokenTransfers.filter(t => {
            // const fromPool = bnbPools.indexOf(t.from.toLowerCase()) >= 0
            const isBNB = t.token.toLowerCase() === WBNB
            const isUSDT = t.token.toLowerCase() === USDT
            const isBUSD = t.token.toLowerCase() === BUSD
            const toRouter = t.to.toLowerCase() === to.toLowerCase()
            const toCaller = t.to.toLowerCase() === caller.toLowerCase()
            if (isBNB && toRouter) {
                bnb += Number(t.amount)
                totalBnb += bnb
                return true
            } else if (isBUSD && toCaller) {
                busd += Number(t.amount)
                totalBusd += busd
                return true
            } else if (isUSDT && toCaller) {
                usdt += Number(t.amount)
                totalUsdt += usdt
                return true
            } else return false
        })

        if (transfers.length === 0 || (bnb === 0 && busd === 0 && usdt === 0)) {
            console.log("Zero bnb sent")
            continue
        }
        console.log("Token: ", bnb, busd, usdt, "CRSS: ", crss)
        console.log("Token: ", bnb || busd || usdt, "CRSS: ", crss)
        totalCrss += crss
        console.log("Total: ", totalBnb, totalBusd, totalUsdt, totalCrss)

        dipSellers.push({
            account: caller,
            amount: crss,
            sold: bnb,
            txHash: tx
        })
    }
    fs.writeFileSync("./_snapshot/report/dipSell/bnbSeller.json", JSON.stringify(dipSellers))

}

const analysisDip = (path, isBNB) => {
    let data = fs.readFileSync(`${path}.json`, 'utf-8')
    data = JSON.parse(data)

    let sold = 0
    let crss = 0

    let bnbThre = 0
    let busdThre = 0
    for (let i = 0; i < data.length; i++) {
        if (data[i].sold > 0.2 && isBNB) bnbThre++
        if (data[i].sold > 100 && !isBNB) busdThre++

        sold += data[i].sold
        crss += data[i].amount
    }

    console.log("Total: ", sold, crss, bnbThre, busdThre, data.length)
    data = data.sort((a, b) => b.sold - a.sold)
    fs.writeFileSync(`${path}Sorted.json`, JSON.stringify(data))
}

main()