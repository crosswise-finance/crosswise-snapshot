const fs = require("fs")
const masterChef = "0x70873211cb64c1d4ec027ea63a399a7d07c4085b"

const main = () => {
    let txs = fs.readFileSync("Final.txt", 'utf-8');
    txs = "[" + txs.trim().split("\n").join(",").toString() + "]"
    txs = JSON.parse(txs)

    const masterchefTx = txs.filter((tx) => tx.To === masterChef && tx.ErrCode === "")
    console.log("Masterchef Transactions: ".yellow, masterchefTx.length)

    const savePath = "./_snapshot/transactions/masterchefTxWithParams.json"
    fs.writeFileSync(savePath, JSON.stringify(masterchefTx))
}

main()