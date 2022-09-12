const fs = require("fs");
const utils = require("./utils");
require("colors")

async function main() {
    const rpcProvider = "https://bsc-dataseed2.defibit.io/";
    const orderTxPath = './_snapshot/transactions/orderedTx.json'
    let txs = fs.readFileSync(orderTxPath, 'utf-8');
    txs = JSON.parse(txs)

    console.log("Total Transactions".yellow, txs.length)

    const transfers = utils.readTransfers()
    utils.searchExternalTxs(txs, transfers)
    utils.orderTransfers(txs, transfers, rpcProvider, '_snapshot/transfer/orderedTransfers.json')
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
