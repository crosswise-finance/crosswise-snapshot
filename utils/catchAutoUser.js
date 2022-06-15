const fs = require("fs")

const main = () => {
    let txs = fs.readFileSync("Final.txt", 'utf-8');
    txs = "[" + txs.trim().split("\n").join(",").toString() + "]"
    txs = JSON.parse(txs)

    autoDeposit = txs.filter(tx => tx.Method === 'deposit' && tx.params[4] === true)
    console.log("Auto User number: ", autoDeposit.length)
}

main()