const { assert } = require("chai");
// const { ethers } = require("ethers");
const fs = require("fs")
const { transactionFiles } = require("./crosswise-v1.js");

const { abi: pairAbi } = require("../artifacts/contracts/CrssPair.sol/CrosswisePair.json");
const { abi: routerAbi } = require("../artifacts/contracts/Router.sol/CrosswiseRouter.json");
const { abi: factoryAbi } = require("../artifacts/contracts/CrssPair.sol/CrosswiseFactory.json");
const { abi: crssAbi } = require("../artifacts/contracts/MasterChef.sol/CrssToken.json");
const { abi: xcrssAbi } = require("../artifacts/contracts/MasterChef.sol/xCrssToken.json");
const { abi: masterchefAbi } = require("../artifacts/contracts/MasterChef.sol/MasterChef.json");
const { abi: mockBUSDAbi } = require("../artifacts/contracts/MockBUSD.sol/MockBUSD.json")

async function getOrderedSystemTxList(startBlock, sysTxList, BoundaryTxHash, rpcProvider, filename) {
    let orderedSysTxList;

    orderedSysTxList = sysTxList.sort((a, b) => Number(a.Blockno) - Number(b.Blockno));

    let startIndex = orderedSysTxList.map(o => o.Blockno).indexOf(startBlock.toString());
    if (startIndex < 0) startIndex = 0
    console.log("Start Index: ", startIndex, "To: ", orderedSysTxList.length)

    for (let i = startIndex; i < orderedSysTxList.length; i++) {
        if (i < orderedSysTxList.length -1 && orderedSysTxList[i].Blockno == orderedSysTxList[i + 1].Blockno) {
            const blockNo = orderedSysTxList[i].Blockno;
            const lastIndex = orderedSysTxList.map(o => o.Blockno).lastIndexOf(blockNo);
            const subData = orderedSysTxList.slice(i, lastIndex + 1);
            console.log("SubData: ", i, lastIndex, blockNo)
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
                fs.appendFileSync(filename, JSON.stringify(subData[j]) + "\n");
            }
            i = lastIndex;
        } else {
            fs.appendFileSync(filename, JSON.stringify(orderedSysTxList[i]) + "\n");
        }
    }

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
        // if((txParam.length - 2) % 64 != 0) {
        // throw("Invalid Transaction Data")
        // } else {
        const abiCoder = new ethers.utils.AbiCoder
        const method = orderedSysTxList[i].Method
        const contract = orderedSysTxList[i].contract
        console.log(method, contract)
        const contractIndex = transactionFiles.map(t => t.contract).indexOf(contract)
        if (contractIndex < 0) throw ("Invalid Contract")
        const methodIndex = transactionFiles[contractIndex].methods.map(m => m.code).indexOf(method)
        // if (methodIndex < 0) continue
        const data = abiCoder.decode(transactionFiles[contractIndex].methods[methodIndex].params, txParam)
        orderedSysTxList[i].params = data;
        fs.appendFileSync(filename, JSON.stringify(orderedSysTxList[i]) + "\n")
        console.log(i)
        // }
    }

    // }
    // Add to each Tx object an attribute named "args" and with value [argValue1, argValue2, ...].
    // Retrieve the values from the chain.

    // return orderedSysTxListWithArguments;
}

const pairTokens = {
    crssV11: "0x99FEFBC5cA74cc740395D65D384EDD52Cb3088Bb",
    busd: "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56",
    usdc: "0x55d398326f99059fF775485246999027B3197955",
    weth: "0x2170Ed0880ac9A755fd29B2688956BD959F933F8",
    btcb: "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c",
    cake: "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82",
    dot: "0x7083609fCE4d1d8Dc0C979AAb8c869Ea2C873402",
    ada: "0x3EE2200Efb3400fAbB9AacF31297cBdD1d435D47",
    link: "0xF8A0BF9cF54Bb92F17374d9e9A321E6a111a51bD"
}

const knownAddress = {
    crssbnb: "0xb5d85cA38a9CbE63156a02650884D92A6e736DDC",
    crssbusd: "0xB9B09264779733B8657b9B86970E3DB74561c237",
    crssusdc: "0x21d398F619a7A97e0CAb6443fd76Ef702B6dCE8D",
    wethbnb: "0x8151D70B5806E3C957d9deB8bbB01352482a4741",
    adabnb: "0xDE0356A496a8d492431b808c758ed5075Dd85040",
    bnbbusd: "0x290E1ad05b4D906B1E65B41e689FC842C9962825",
    bnblink: "0x278D7d1834E008864cfB247704cF34a171F39a2C",
    btcbbnb: "0x9Ba0DcE71930E6593aB34A1EBc71C5CebEffDeAF",
    busdusdc: "0xef5be81A2B5441ff817Dc3C15FEF0950DD88b9bD",
    cakebnb: "0x0458498C2cCbBe4731048751896A052e2a5CC041",
    dotbnb: "0xCB7Ad3af3aE8d6A04ac8ECA9a77a95B2a72B06DE",
    router: "0x8B6e0Aa1E9363765Ea106fa42Fc665C691443b63",
    masterChef: "0x70873211CB64c1D4EC027Ea63A399A7d07c4085B",
    xcrss: "0x27DF46ddd86D9b7afe3ED550941638172eB2e623",
    wbnb: "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c",
    factory: "0x47b30B5eD46101473ED2AEc7b9046aaCb6fd4bBC"
}

async function applySystemTxes(contracts, transactions) {

    var userHistory;
    const trustedForwarder = contracts.trustedForwarder;
    let prevBlock = transactions[0].Blockno;
    console.log("Start Block: ", prevBlock)
    // for (let i = 0; i < 2; i++) {
    for (let i = 0; i < transactions.length; i++) {
        const blockno = transactions[i].Blockno
        for (let m=0;m < blockno - prevBlock - 1;m++) {
            await network.provider.send("evm_mine");
        }
        prevBlock = blockno;
        console.log("Block: ", blockno)
        const contractName = transactions[i].contract
        const sender = transactions[i].From
        const contract = contracts[contractName]
        const method = transactions[i].Method
        const params = transactions[i].params
        // contract[method](params);
        const interface = new ethers.utils.Interface(getAbi(contractName));

        // Set Token Address and mint for liquidity action
        const tokenNames = Object.keys(pairTokens);
        for (let i=0; i < tokenNames.length; i++) {
            for (let j=0;j < params.length; j++) {
                if (params[j] == pairTokens[tokenNames[i]]) {
                    console.log(tokenNames[i])
                    const mockTokenName = tokenNames[i];
                    const mockToken = contracts[mockTokenName];
                    // Update token address in params with the mock one
                    params[j] = mockToken.address
                    // Mint Mock token to user
                    mockToken.mint(sender, ethers.utils.parseEther("1000000"));
                    const mockInterface = new ethers.utils.Interface(mockBUSDAbi);
                    const data = mockInterface.encodeFunctionData("approve", [contract.address, ethers.utils.parseEther("1000000")])
                    await trustedForwarder.execute(mockToken.address, sender, data)
                    const result = await trustedForwarder.state()
                    if (!result) throw(`Error: ${transactions[i].Txhash} Approve failed`)
                    const allowance = await mockToken.allowance(sender, contract.address)
                    console.log("Allowance: ", allowance)
                }
            }
        }

        const contractNames = Object.keys(knownAddress);
        for (let i=0; i < contractNames.length; i++) {
            for (let j=0;j < params.length; j++) {
                if (params[j] == knownAddress[contractNames[i]]) {
                    const mockCotractName = contractNames[i];
                    const mockContract = contracts[mockCotractName];
                    // Update token address in params with the mock one
                    params[j] = mockContract.address
                    // console.log(mockContract.address)
                    // Mint Mock token to user
                }
            }
        }
        
        const data = interface.encodeFunctionData(method, params)
        await trustedForwarder.execute(contract.address, sender, data, {value: ethers.utils.parseEther(transactions[i]["Value_IN(BNB)"])})
        await network.provider.send("evm_mine");
        const result = await trustedForwarder.state()
        if (!result) throw(`Error: ${transactions[i].Txhash}`)

        const block = await ethers.provider.getBlock("latest");
        console.log("Contract: ", contractName, "Method: ", method, "index: ", i, "BlockNumber: ", block.number, blockno)
    }

    return userHistory;
}

function getAbi(contract) {
    switch (contract) {
        case "factory":
            return factoryAbi;
        case "router":
            return routerAbi;
        case "crssV11":
            return crssAbi;
        case "xcrss":
            return xcrssAbi;
        case "masterChef":
            return masterchefAbi;
        case "crssbnb":
            return pairAbi;
        case "mockBUSD":
            return mockBUSDAbi;
        case "crssbusd":
            return pairAbi;
        default:
            return pairAbi;
    }
}

exports.getOrderedSystemTxList = getOrderedSystemTxList;
exports.populateSysTxListWithArguments = populateSysTxListWithArguments;
exports.applySystemTxes = applySystemTxes;