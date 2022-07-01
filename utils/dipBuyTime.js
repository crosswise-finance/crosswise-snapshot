const fs = require("fs")
const ethers = require("ethers")

const main = async () => {
    let txs = fs.readFileSync("./_snapshot/transactions/orderedTx.json", "utf-8")
    txs = JSON.parse(txs)
    let bnbSellers = await populateTime(txs, "./_snapshot/report/dipBuy/bnbSeller")
    fs.writeFileSync("./_snapshot/report/dipBuy/bnbSellerTime.json", JSON.stringify(bnbSellers))
    let busdSellers = await populateTime(txs, "./_snapshot/report/dipBuy/busdSeller")
    fs.writeFileSync("./_snapshot/report/dipBuy/busdSellerTime.json", JSON.stringify(busdSellers))
    let usdtSellers = await populateTime(txs, "./_snapshot/report/dipBuy/usdtSeller")
    fs.writeFileSync("./_snapshot/report/dipBuy/usdtSellerTime.json", JSON.stringify(usdtSellers))
    bnbSellers = await populateTime(txs, "./_snapshot/report/dipSell/bnbSeller")
    fs.writeFileSync("./_snapshot/report/dipSell/bnbSellerTime.json", JSON.stringify(bnbSellers))
    busdSellers = await populateTime(txs, "./_snapshot/report/dipSell/busdSeller")
    fs.writeFileSync("./_snapshot/report/dipSell/busdSellerTime.json", JSON.stringify(busdSellers))
    usdtSellers = await populateTime(txs, "./_snapshot/report/dipSell/usdtSeller")
    fs.writeFileSync("./_snapshot/report/dipSell/usdtSellerTime.json", JSON.stringify(usdtSellers))
}

const populateTime = async (txs, file) => {
    const rpcProvider = "https://bsc-dataseed1.defibit.io/";
    const provider = new ethers.providers.JsonRpcProvider(rpcProvider);
    // fs.writeFileSync(`${file}Time.json`, "[")

    let buyers = fs.readFileSync(`${file}.json`, "utf-8")
    buyers = JSON.parse(buyers)
    // for (let i = 0; i < 2; i++) {
    for (let i = 0; i < buyers.length; i++) {
        const index = txs.map(tx => tx.Txhash).indexOf(buyers[i].txHash)
        if (index < 0) {
            console.log("Out Tx: ", i, buyers[i].txHash)
            const data = await provider.getTransaction(buyers[i].txHash)
            const block = await provider.getBlock(data.blockNumber)
            console.log("Data: ", block.timestamp)
            buyers[i].createdAt = block.timestamp
            // buyers[i].createdAt = i;
        } else {
            buyers[i].createdAt = txs[index].UnixTimestamp
        }
        fs.appendFileSync(`${file}Time.json`, JSON.stringify(buyers[i]) + ",\n")
    }
    buyers = buyers.sort((a, b) => a.createdAt - b.createdAt)
    fs.writeFileSync(`${file}Time.json`, "]")
    return buyers
}

main()