const fs = require("fs");
const utils = require("./utils");
const { getOrderedSystemTxList } = require("./utils")
const { attackTxHash } = require("./constants")

async function main() {

    const basefolder = "./_supporting";
    const sysTxList = utils.getSystemTxList(basefolder);
    const rpcProvider = "https://bsc-dataseed2.defibit.io/";

    const orderTxPath = './_snapshot/transactions/orderedTx.json'
    const txs = await getOrderedSystemTxList(0, sysTxList, attackTxHash, rpcProvider, orderTxPath);

    console.log("Total Transactions", txs.length)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
