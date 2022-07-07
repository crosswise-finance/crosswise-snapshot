const fs = require("fs")
const ethers = require("ethers")

const main = async () => {
    let txs = fs.readFileSync("./_snapshot/transactions/orderedTx.json", "utf-8")
    txs = JSON.parse(txs)
    let bnbSellers = await populateUSD(txs, "./_snapshot/report/dipBuy/bnbSellerTime")
    fs.writeFileSync("./_snapshot/report/dipBuy/bnbSellerUSD.json", JSON.stringify(bnbSellers))
    bnbSellers = await populateUSD(txs, "./_snapshot/report/dipSell/bnbSellerTime")
    fs.writeFileSync("./_snapshot/report/dipSell/bnbSellerUSD.json", JSON.stringify(bnbSellers))
}

const populateUSD = async (txs, file) => {
    const rpcProvider = "https://bsc-dataseed1.defibit.io/";
    const provider = new ethers.providers.JsonRpcProvider(rpcProvider);
    fs.writeFileSync(`${file}USD.json`, "[")

    let buyers = fs.readFileSync(`${file}.json`, "utf-8")
    buyers = JSON.parse(buyers)
    for (let i = 0; i < 2; i++) {
        // for (let i = 0; i < buyers.length; i++) {
        const index = txs.map(tx => tx.Txhash).indexOf(buyers[i].txHash)
        if (index < 0) {
            console.log("Out Tx: ", i, buyers[i].txHash)
            const data = await provider.getTransaction(buyers[i].txHash)
            const block = await provider.getBlock(data.blockNumber)
            console.log("Data: ", data)
            // buyers[i].createdAt = block.timestamp
            // buyers[i].createdAt = i;
        } else {
            buyers[i].createdAt = txs[index].UnixTimestamp
        }
        fs.appendFileSync(`${file}USD.json`, JSON.stringify(buyers[i]) + ",\n")
    }
    buyers = buyers.sort((a, b) => a.createdAt - b.createdAt)
    fs.appendFileSync(`${file}USD.json`, "]")
    return buyers
}

main()