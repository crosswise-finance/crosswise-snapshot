const fs = require("fs")

const startIndexAfterExploit = "0x9fb5e099444a6da9db6964e5ee8a9b78e7a594bcfcfeffac06d972b446409ac4"

const main = () => {

    let txs = fs.readFileSync("./_snapshot/transactions/orderedTx.json")
    txs = JSON.parse(txs)
    const lastAttackIndex = txs.map(t => t.Txhash).lastIndexOf(startIndexAfterExploit)

    txs = txs.slice(lastAttackIndex + 1)
    console.log("Txs happened after exploit: ", txs.length)

    txs = txs.filter(tx => tx.Method.indexOf("add") >= 0)
    console.log("Add Liquidity happened after exploit: ", txs.length)
    console.log(txs.map(tx => tx.Txhash))
}

main()