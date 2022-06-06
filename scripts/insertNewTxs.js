const hre = require("hardhat");
const fs = require("fs");
const ethers = require("ethers")
const crosswise1 = require("./crosswise-v1");
const ethereum = require("./ethereum");

async function main() {
    const rpcProvider = "https://bsc-dataseed2.defibit.io/";
    
    // const provider = new ethers.providers.JsonRpcProvider(rpcProvider);
    // const blockData = await provider.getBlock(Number(14304432));
    // fs.writeFileSync("BLOCK.txt", JSON.stringify(blockData.transactions)) 

    let txlist = fs.readFileSync("orderWithClaimAmount.txt", 'utf-8');
    txlist = "[" + txlist.trim().split("\n").join(",").toString() + "]"
    txlist = JSON.parse(txlist)
    let newTxs = fs.readFileSync("orderTxWithParams-LP.txt", 'utf-8');
    newTxs = "[" + newTxs.trim().split("\n").join(",").toString() + "]"
    newTxs = JSON.parse(newTxs)
    console.log(txlist.length, newTxs.length)

    let i=0;
    let j;
    const newTxList = [];
    for (j=0;j<txlist.length;j++) {
        if (txlist[j].Blockno < newTxs[i].Blockno) {
            newTxList.push(txlist[j])
        } else if (txlist[j].Blockno > newTxs[i].Blockno) {
            newTxList.push(newTxs[i]);
            i++;
            newTxList.push(txlist[j])
        } else {
            const blockNo = txlist[j].Blockno;
            const blockData = await getTransactionInBlock(blockNo, rpcProvider)
            
            const lastIndex = txlist.map(o => o.Blockno).lastIndexOf(blockNo);
            const subtxlist = txlist.slice(j, lastIndex + 1);
            console.log("subtxlist: ", j, lastIndex, blockNo)
            
            const lastIndexNew = newTxs.map(o => o.Blockno).lastIndexOf(blockNo);
            const subNewTx = newTxs.slice(i, lastIndexNew + 1);
            console.log("SubNewTx: ", i, lastIndexNew)
            subtxlist.push(...subNewTx)
            subtxlist.sort((a, b) => {
                const aIndex = blockData.transactions.indexOf(a.Txhash)
                const bIndex = blockData.transactions.indexOf(b.Txhash)
                if (aIndex < 0 || bIndex < 0) {
                    const log = `Tx: ${blockData.number}\n${blockData.transactions}\nA: ${a.Txhash}, ${a.Blockno}\nB: ${b.Txhash}, ${b.Blockno}`
                    fs.writeFileSync("order_log.txt", log);
                    throw (`Not exist in ${blockNo} block`)
                }
                return aIndex - bIndex
            })
            newTxList.push(...subtxlist);
            i = lastIndexNew + 1;
            j = lastIndex;
            console.log(i, j, newTxList.length)
        }
        if (i == newTxs.length) {
            break;
        }
    }

    for (let k=0;k < newTxList.length; k++) {
        fs.appendFileSync("FinalTemp.txt", JSON.stringify(newTxList[k]) + "\n")
    }

    if (i < newTxs.length) {
        newTxList.push(...newTxs.slice(i))
    } else if (j < txlist.length) {
        newTxList.push(...txlist.slice(j + 1))
    } else if (i != newTxs.length && j != txlist.length) {
        throw("Error: Not finished")
    }

    console.log("Finished: ", newTxList.length);
    for (let k=0;k < newTxList.length; k++) {
        fs.appendFileSync("Final.txt", JSON.stringify(newTxList[k]) + "\n")
    }
}

async function getTransactionInBlock(block, rpc) {
    const provider = new ethers.providers.JsonRpcProvider(rpc);
    const blockData = await provider.getBlock(Number(block));
    return blockData
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
