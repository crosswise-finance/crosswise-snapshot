const { ethers } = require("ethers");
const fs = require("fs")
const { transactionFiles } = require("./utils.js");

async function getOrderedSystemTxList(startBlock, sysTxList, BoundaryTxHash, rpcProvider, filename) {
    let orderedSysTxList;

    orderedSysTxList = sysTxList.sort((a, b) => Number(a.Blockno) - Number(b.Blockno));

    let startIndex = orderedSysTxList.map(o => o.Blockno).indexOf(startBlock.toString());
    if (startIndex < 0) startIndex = 0
    console.log("Start Index: ", startIndex, "To: ", orderedSysTxList.length)

    fs.writeFileSync(filename, "[");
    for (let i = startIndex; i < orderedSysTxList.length; i++) {
        if (i < orderedSysTxList.length - 1 && orderedSysTxList[i].Blockno == orderedSysTxList[i + 1].Blockno) {
            const blockNo = orderedSysTxList[i].Blockno;
            const lastIndex = orderedSysTxList.map(o => o.Blockno).lastIndexOf(blockNo);
            const subData = orderedSysTxList.slice(i, lastIndex + 1);
            const blockData = await getTransactionInBlock(blockNo, rpcProvider)
            subData.sort((a, b) => {
                const aIndex = blockData.transactions.indexOf(a.Txhash)
                const bIndex = blockData.transactions.indexOf(b.Txhash)
                if (aIndex < 0 || bIndex < 0) {
                    const log = `Tx: ${blockData.number}\n${blockData.transactions}\nA: ${a.Txhash}, ${a.Blockno}\nB: ${b.Txhash}, ${b.Blockno}`
                    fs.writeFileSync("order_log.txt", log);
                    throw (`Not exist in ${blockNo} block`)
                }
                return aIndex - bIndex
            })
            for (let j = 0; j < subData.length; j++) {
                if (i === orderedSysTxList.length - 1)
                    fs.appendFileSync(filename, JSON.stringify(subData[j]) + "\n");
                else
                    fs.appendFileSync(filename, JSON.stringify(subData[j]) + ',' + "\n");
            }
            console.log(`From ${i} to ${lastIndex} are in same block`.yellow)
            i = lastIndex;
        } else {
            if (i === orderedSysTxList.length - 1)
                fs.appendFileSync(filename, JSON.stringify(orderedSysTxList[i]) + "\n");
            else
                fs.appendFileSync(filename, JSON.stringify(orderedSysTxList[i]) + "," + "\n");
        }
    }
    fs.appendFileSync(filename, "]");

    return orderedSysTxList;
}

async function getTransactionInBlock(block, rpc) {
    const provider = new ethers.providers.JsonRpcProvider(rpc);
    const blockData = await provider.getBlock(Number(block));
    return blockData
}

async function populateSysTxListWithArguments(start, end, orderedSysTxList, rpc, filename) {
    const provider = new ethers.providers.JsonRpcProvider(rpc);
    for (let i = start; i < end; i++) {
        const transaction = await provider.getTransaction(orderedSysTxList[i].Txhash)
        const txParam = `0x${transaction.data.slice(10)}`;
        const abiCoder = new ethers.utils.AbiCoder
        const method = orderedSysTxList[i].Method
        const contract = orderedSysTxList[i].contract
        const contractIndex = transactionFiles.map(t => t.contract).indexOf(contract)
        if (contractIndex < 0) throw ("Invalid Contract")
        const methodIndex = transactionFiles[contractIndex].methods.map(m => m.code).indexOf(method)
        // if (methodIndex < 0) continue
        const data = abiCoder.decode(transactionFiles[contractIndex].methods[methodIndex].params, txParam)
        orderedSysTxList[i].params = data;
        fs.appendFileSync(filename, JSON.stringify(orderedSysTxList[i]) + "\n")
    }
}

exports.getOrderedSystemTxList = getOrderedSystemTxList;
exports.populateSysTxListWithArguments = populateSysTxListWithArguments;