const fs = require("fs")

const firstTxAfterExploit = "0x0c0bcfd5d6e865e15721482925553e5689d6fe12dab4557a399c58981ae014bd"

const main = () => {
    let txs = fs.readFileSync("Final.txt", 'utf-8');
    txs = "[" + txs.trim().split("\n").join(",").toString() + "]"
    txs = JSON.parse(txs)

    const index = txs.map(tx => tx.Txhash).indexOf(firstTxAfterExploit)
    txs = txs.slice(index)
    console.log("Transactions: ", txs.length)
    let removeTxs = txs.filter(tx => tx.Method.indexOf("remove") >= 0 && tx.ErrCode === "")
    console.log("Remove transactions: ", removeTxs.length)

    fs.writeFileSync("_snapshot/lpmove/remove.json", JSON.stringify(removeTxs))

    let addTxs = txs.filter(tx => tx.Method.indexOf("add") >= 0 && tx.ErrCode === "")
    console.log("Add transactions: ", addTxs.length)

    fs.writeFileSync("_snapshot/lpmove/add.json", JSON.stringify(addTxs))
}

main()