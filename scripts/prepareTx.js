const hre = require("hardhat");
const fs = require("fs");
const ethers = require("ethers")
const utils = require("./crosswise-v1");
const ethereum = require("./ethereum");

async function main() {
    // basefolder = "./_supporting";
    const rpcProvider = "https://bsc-dataseed2.defibit.io/"; // --------- use Infura
    // var sysTxList = utils.getSystemTxList(basefolder);
    // console.log("Total: ", sysTxList.length)
    // ethereum.getOrderedSystemTxList(0, sysTxList, utils.attackTxHash, rpcProvider, "orderTx-Test.txt");

    const provider = new ethers.providers.JsonRpcProvider(rpcProvider);
    // const blockData = await provider.getBlock(Number(14304432));
    // fs.writeFileSync("BLOCK.txt", JSON.stringify(blockData.transactions)) 

    // var orderedSysTxList = fs.readFileSync("orderTx-LP.txt", 'utf-8');
    // orderedSysTxList = "[" + orderedSysTxList.trim().split("\n").join(",").toString() + "]"
    // orderedSysTxList = JSON.parse(orderedSysTxList)

    // ethereum.populateSysTxListWithArguments(0, orderedSysTxList.length, orderedSysTxList, rpcProvider, "orderTxWithParams-LP.txt");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});