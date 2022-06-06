const hre = require("hardhat");
const fs = require("fs");
const ethers = require("ethers")
const crosswise1 = require("./crosswise-v1");
const ethereum = require("./ethereum");

async function main() {
    const rpcProvider = "https://bsc-dataseed2.defibit.io/"; // --------- use Infura
    const no = 14295628;
    const provider = new ethers.providers.JsonRpcProvider(rpcProvider);
    const blockData = await provider.getBlock(Number(no));
    fs.writeFileSync("BLOCK.txt", JSON.stringify(blockData.transactions)) 
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});