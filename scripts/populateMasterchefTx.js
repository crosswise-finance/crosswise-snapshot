const fs = require("fs")
const { populateSysTxListWithArguments } = require("./utils")

const masterChef = "0x70873211cb64c1d4ec027ea63a399a7d07c4085b"

const main = async () => {
    const transactionPath = "./_snapshot/transactions/orderedTx.json"
    const rpcProvider = "https://bsc-dataseed2.defibit.io/";

    let txs = fs.readFileSync(transactionPath, 'utf-8')
    txs = JSON.parse(txs)
    console.log("Total Transactions: ".yellow, txs.length)

    const masterchefTx = txs.filter((tx) => tx.To === masterChef && tx.ErrCode === "")
    console.log("Masterchef Transactions: ".yellow, masterchefTx.length)

    const savePath = "./_snapshot/transactions/masterchefTxWithParams.json"
    await populateSysTxListWithArguments(0, masterchefTx.length, masterchefTx, rpcProvider, savePath)
}

main()