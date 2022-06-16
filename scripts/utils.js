const fs = require("fs");
const { ethers, network } = require("hardhat");
const pairAbi = require("../_supporting/abi_lp.json");
require("colors")

const transactionFiles = [
    {
        file: "TxHistory - Router.csv",
        contract: "router",
        methods: [
            { description: "Add Liquidity", code: "addLiquidity", params: ["address", "address", "uint", "uint", "uint", "uint", "address", "uint"] },
            { description: "Add Liquidity ETH", code: "addLiquidityETH", params: ["address", "uint", "uint", "uint", "address", "uint"] },
            { description: "Pause Price Guard", code: "pausePriceGuard", params: ['address', 'bool'] },
            { description: "Remove Liquidity", code: "removeLiquidity", params: ["address", "address", "uint", "uint", "uint", "address", "uint"] },
            { description: "Remove Liquidity ETH", code: "removeLiquidityETH", params: ["address", "uint", "uint", "uint", "address", "uint"] },
            { description: "Remove Liquidity ETH With Permit", code: "removeLiquidityETHWithPermit", params: ["address", "uint", "uint", "uint", "address", "uint", "bool", "uint8", "bytes32", "bytes32"] }, // Chekced
            { description: "Remove Liquidity ETH With Permit Supporting Fee On Transfer Tokens", code: "removeLiquidityETHWithPermitSupportingFeeOnTransferTokens", params: ["address", "uint", "uint", "uint", "address", "uint", "bool", "uint8", "bytes32", "bytes32"] },
            { description: "Remove Liquidity With Permit", code: "removeLiquidityWithPermit", params: ["address", "address", "uint", "uint", "uint", "address", "uint", "bool", "uint8", "bytes32", "bytes32"] },
            { description: "Set Anti Whale", code: "setAntiWhale", params: ["address", "bool"] },
            { description: "Setwhitelist Token", code: "setwhitelistToken", params: ["address", "bool"] },
            { description: "Set Max Spread Tolerance", code: "setMaxSpreadTolerance", params: ["address", "uint256"] },
            { description: "Swap ETH For Exact Tokens", code: "swapETHForExactTokens", params: ["uint", "address[]", "address", "uint"] },
            { description: "Swap Exact ETH For Tokens", code: "swapExactETHForTokens", params: ["uint", "address[]", "address", "uint"] },
            { description: "Swap Exact ETH For Tokens Supporting Fee On Transfer Tokens", code: "swapExactETHForTokensSupportingFeeOnTransferTokens", params: ["uint", "address[]", "address", "uint"] },
            { description: "Swap Exact Tokens For ETH", code: "swapExactTokensForETH", params: ["uint", "uint", "address[]", "address", "uint"] },
            { description: "Swap Exact Tokens For Tokens", code: "swapExactTokensForTokens", params: ["uint", "uint", "address[]", "address", "uint"] },
            { description: "Swap Exact Tokens For Tokens Supporting Fee On Transfer Tokens", code: "swapExactTokensForTokensSupportingFeeOnTransferTokens", params: ["uint", "uint", "address[]", "address", "uint"] }, //Checked
            { description: "Swap Tokens For Exact Tokens", code: "swapTokensForExactTokens", params: ["uint", "uint", "address[]", "address", "uint"] },
            { description: "Swap Exact Tokens For ETH Supporting Fee On Transfer Tokens", code: "swapExactTokensForETHSupportingFeeOnTransferTokens", params: ["uint", "uint", "address[]", "address", "uint"] },
        ],
    },
    {
        file: "TxHistory - CrssBnb.csv",
        contract: "crssbnb",
        methods: [
            { description: "Approve", code: "approve", params: ["address", "uint"] },
            { description: "Transfer", code: "transfer", params: ["address", "uint"] },
            { description: "Sync", code: "sync", params: [] }
        ],
    },
    {
        file: "TxHistory - CrssBusd.csv",
        contract: "crssbusd",
        methods: [
            { description: "Approve", code: "approve", params: ["address", "uint"] },
            { description: "Transfer", code: "transfer", params: ["address", "uint"] },
            { description: "Sync", code: "sync", params: [] }
        ],
    },
    {
        file: "TxHistory - Crss11.csv",
        contract: "crssV11",
        methods: [
            { description: "Set Swap And Liquify Enabled", code: "setSwapAndLiquifyEnabled", params: ['bool'] },
            { description: "Claim V1Token", code: "claimV1Token", params: [] },
            { description: "Transfer Ownership", code: "transferOwnership", params: ["address"] },
            { description: "Init_router", code: "init_router", params: ["address"] },
            { description: "Approve", code: "approve", params: ["address", "uint256"] },
            { description: "Set Excluded From Anti Whale", code: "setExcludedFromAntiWhale", params: ["address", "bool"] },
            { description: "Set White List", code: "setWhiteList", params: ["address", "bool"] },
            { description: "Transfer", code: "transfer", params: ["address", "uint256"] },
            { description: "Increase Allowance", code: "increaseAllowance", params: ["address", "uint256"] },
        ],
    },
    {
        file: "TxHistory - Master.csv",
        contract: "masterChef",
        methods: [
            { description: "Add", code: "add", params: ["uint256", "address", "uint256", "address", "bool"] },
            { description: "Set Crss Referral", code: "setCrssReferral", params: ["address"] },
            { description: "Transfer Ownership", code: "transferOwnership", params: ["address"] },
            { description: "Mass Stake Reward", code: "massStakeReward", params: ["uint256[]"] },
            { description: "Mass Harvest", code: "massHarvest", params: ["uint256[]"] },
            { description: "Deposit", code: "deposit", params: ["uint256", "uint256", "address", "bool", "bool"] },
            { description: "Withdraw", code: "withdraw", params: ["uint256", "uint256"] },
            { description: "Earn", code: "earn", params: ["uint256"] },
            { description: "Set Trusted Forwarder", code: "setTrustedForwarder", params: ["address"] },
            { description: "Mass Update Pools", code: "massUpdatePools", params: [] },
            { description: "Update Emission Rate", code: "updateEmissionRate", params: ["uint256"] },
            { description: "Set Dev Address", code: "setDevAddress", params: ["address"] },
            { description: "Set Treasury Address", code: "setTreasuryAddress", params: ["address"] },// Checked
            { description: "Emergency Withdraw", code: "emergencyWithdraw", params: ["uint256"] },// Checked
            { description: "Leave Staking", code: "leaveStaking", params: ["uint256"] },// Checked
            { description: "Enter Staking", code: "enterStaking", params: ["uint256"] },// Checked
            { description: "Set", code: "set", params: ["uint256", "uint256", "uint256", "address", "bool"] },// Checked
            { description: "Update Pool", code: "updatePool", params: ["uint256"] },// Checked
        ],
    },
    {
        file: "TxHistory - XCrss.csv",
        contract: "xcrss",
        methods: [
            { description: "Initialize", code: "initialize", params: ["address", "address", "address"] },
            { description: "Transfer", code: "transfer", params: ["address", "uint256"] },
            { description: "Approve", code: "approve", params: ["address", "uint256"] }
        ],
    },
    {
        file: "TxHistory - CrssUSDT.csv",
        contract: "crssusdt",
        methods: [
            { description: "Skim", code: "skim", params: ["address"] },
            { description: "Approve", code: "approve", params: ["address", "uint"] }
        ],
    },
    {
        file: "TxHistory - WethBnb.csv",
        contract: "wethbnb",
        methods: [
            { description: "Skim", code: "skim", params: ["address"] },
            { description: "Approve", code: "approve", params: ["address", "uint"] },
            { description: "Transfer", code: "transfer", params: ["address", "uint"] },
            { description: "Sync", code: "sync", params: [] }
        ],
    },
    {
        file: "TxHistory - AdaBnb.csv",
        contract: "adabnb",
        methods: [
            { description: "Skim", code: "skim", params: ["address"] },
            { description: "Approve", code: "approve", params: ["address", "uint"] },
            { description: "Transfer", code: "transfer", params: ["address", "uint"] },
            { description: "Sync", code: "sync", params: [] }
        ],
    },
    {
        file: "TxHistory - BnbBusd.csv",
        contract: "bnbbusd",
        methods: [
            { description: "Skim", code: "skim", params: ["address"] },
            { description: "Approve", code: "approve", params: ["address", "uint"] },
            { description: "Transfer", code: "transfer", params: ["address", "uint"] },
            { description: "Sync", code: "sync", params: [] }
        ],
    },
    {
        file: "TxHistory - BnbLink.csv",
        contract: "bnblink",
        methods: [
            { description: "Skim", code: "skim", params: ["address"] },
            { description: "Approve", code: "approve", params: ["address", "uint"] },
            { description: "Transfer", code: "transfer", params: ["address", "uint"] },
            { description: "Sync", code: "sync", params: [] }
        ],
    },
    {
        file: "TxHistory - BtcbBnb.csv",
        contract: "btcbBnb",
        methods: [
            { description: "Skim", code: "skim", params: ["address"] },
            { description: "Approve", code: "approve", params: ["address", "uint"] },
            { description: "Transfer", code: "transfer", params: ["address", "uint"] },
            { description: "Sync", code: "sync", params: [] }
        ],
    },
    {
        file: "TxHistory - BusdUsdt.csv",
        contract: "busdusdt",
        methods: [
            { description: "Skim", code: "skim", params: ["address"] },
            { description: "Approve", code: "approve", params: ["address", "uint"] },
            { description: "Transfer", code: "transfer", params: ["address", "uint"] },
            { description: "Sync", code: "sync", params: [] }
        ],
    },
    {
        file: "TxHistory - CakeBnb.csv",
        contract: "cakebnb",
        methods: [
            { description: "Skim", code: "skim", params: ["address"] },
            { description: "Approve", code: "approve", params: ["address", "uint"] },
            { description: "Transfer", code: "transfer", params: ["address", "uint"] },
            { description: "Sync", code: "sync", params: [] }
        ],
    },
    {
        file: "TxHistory - DotBnb.csv",
        contract: "dotbnb",
        methods: [
            { description: "Skim", code: "skim", params: ["address"] },
            { description: "Approve", code: "approve", params: ["address", "uint"] },
            { description: "Transfer", code: "transfer", params: ["address", "uint"] },
            { description: "Sync", code: "sync", params: [] }
        ],
    },
];

let failTxs = 0

function formatCSV(dataArray, element) {
    let result = [];
    let errors = 0;
    // The array[0] contains all the
    // header columns so we store them
    // in headers array
    let headers = dataArray[0].trim().split(",")

    // Since headers are separated, we
    // need to traverse remaining n-1 rows.
    for (let i = 1; i < dataArray.length - 1; i++) {
        let success = true;
        let obj = {}

        let str = dataArray[i].trim()
        let s = ''

        let properties = str.split(",")

        for (let j in headers) {
            if (headers[j] == 'Method') {
                const index = element.methods.map(e => e.description).indexOf(properties[j])
                if (index < 0) {
                    if (i == 1) {
                        success = false;
                        continue;
                    } else {
                        throw (`Non-registered method ${properties[j]}`)
                    }
                }
                obj[headers[j]] = element.methods[index].code
            } else if (headers[j] == 'Status' && properties[j] != '') {
                failTxs++;
                // success = false;
            } else {
                obj[headers[j]] = properties[j]
            }
        }
        obj.contract = element.contract
        // Add the generated object to our
        // result dataArray
        if (success) {
            result.push(obj)
        } else {
            errors++;
        }
    }
    console.log("Failed: ", failTxs)
    return { result, errors }
}

function realCSVFile(basefolder, element) {
    let txList = [];
    const path = basefolder + '/' + element.file;
    if (fs.existsSync(path)) {
        let data = fs.readFileSync(path, 'utf-8');
        data = data.replace(/"/g, "")
        txList = data.split("\n")
    }
    const result = formatCSV(txList, element)
    return result
    // Read the file into txList which is an Array of txes.
    // A tx is an object 
    // - that represent a line of the csv file, or, equivalently, a transaction on the contract.
    // - this has attribute names equal to the column names of the csv file.
    // Add to each object an attribute named "contract" having the "contract" value found in the file.
    // Replace the "Method" value with the corresponding "code" value found in the file.
    // 'Txhash', 'UnixTimestamp', and 'ContractAddress' should be a string value.
    // Exclude constructor transactions.
}

function getSystemTxList(basefolder) {
    let sysTxList = [];

    transactionFiles.forEach(element => {
        const { result: txList, errors } = realCSVFile(basefolder, element);
        console.log(`${element.contract}: ${txList.length}, errors: ${errors}`)
        sysTxList.push(...txList);
    });

    console.log("\nTotal Transactions: ".green, sysTxList.length)
    return sysTxList;
}

async function deployContracts() {
    [theOwner, Alice, Bob, Charlie] = await ethers.getSigners();

    const devTo = Alice.address
    const buyBackTo = Bob.address
    // deploy all crosswise v1 contracts using hardhat-deploy.
    // contracts is an Array of contracts, with a signer rich of eth for gas fees.
    // a contract is an object { name: contractName, object: hardhat-deploy contract object }

    const Factory = await ethers.getContractFactory("CrosswiseFactory");
    const factory = await Factory.deploy(theOwner.address)
    console.log("Factory Deployed: ", factory.address);

    const WBNB = await ethers.getContractFactory("WBNB")
    const wbnb = await WBNB.deploy();
    console.log("WBNB deployed: ", wbnb.address)

    const PriceConsumer = await ethers.getContractFactory("ChainLinkPriceConsumer");
    const priceConsumer = await PriceConsumer.deploy()
    console.log("Price Consumer Deployed: ", priceConsumer.address)

    const Router = await ethers.getContractFactory("CrosswiseRouter");
    const router = await Router.deploy(factory.address, wbnb.address, priceConsumer.address, theOwner.address)
    console.log("Router deployed at: ", router.address)

    const Crss = await ethers.getContractFactory("CrssToken");
    const crssV11 = await Crss.deploy(devTo, buyBackTo);
    console.log("Crss deployed at: ", crssV11.address)

    const xCrss = await ethers.getContractFactory("xCrssToken");
    const xcrss = await xCrss.deploy();
    console.log("xCrss deployed at: ", xcrss.address)

    const startBlock = await ethers.provider.getBlock("latest");;
    const MasterChef = await ethers.getContractFactory("MasterChef")
    const masterChef = await MasterChef.deploy(crssV11.address, xcrss.address, router.address, devTo, buyBackTo, startBlock.number)
    console.log("Masterchef deployed at: ", masterChef.address)

    const TrustedForwarder = await ethers.getContractFactory("TrustedForwarder")
    const trustedForwarder = await TrustedForwarder.deploy();
    console.log("TrustedForwarder deployed: ", trustedForwarder.address)

    await network.provider.send("evm_mine");

    const MockBUSD = await ethers.getContractFactory("MockBUSD")
    const busd = await MockBUSD.deploy("MOCK", "MBUSD")
    console.log("BUSD deployed: ", busd.address);
    const btcb = await MockBUSD.deploy("MOCKBTCB", "MBTCB")
    console.log("BTCB deployed: ", btcb.address);
    const cake = await MockBUSD.deploy("MOCKCAKE", "MCAKE")
    console.log("CAKE deployed: ", cake.address);
    const usdt = await MockBUSD.deploy("MOCKUSDT", "MUSDT")

    await network.provider.send("evm_mine");

    console.log("USDT deployed: ", usdt.address);
    const dot = await MockBUSD.deploy("MOCKDOT", "MDOT")
    console.log("DOT deployed: ", dot.address);
    const weth = await MockBUSD.deploy("MOCKWETH", "MWETH")
    console.log("WETH deployed: ", weth.address);
    const ada = await MockBUSD.deploy("MOCKADA", "MADA")
    console.log("ADA deployed: ", ada.address);
    const link = await MockBUSD.deploy("MOCKLINK", "MLINK")
    console.log("Link deployed: ", link.address);

    await network.provider.send("evm_mine");

    await factory.createPair(crssV11.address, wbnb.address);
    await network.provider.send("evm_mine");
    const crssbnbAddr = await factory.getPair(crssV11.address, wbnb.address)
    console.log("Crss-BNB: ", crssbnbAddr)
    crssbnb = new ethers.Contract(crssbnbAddr, pairAbi, theOwner);

    await factory.createPair(crssV11.address, busd.address);
    await network.provider.send("evm_mine");
    const crssbusdAddr = await factory.getPair(crssV11.address, busd.address)
    console.log("Crss-Busd: ", crssbusdAddr)
    crssbusd = new ethers.Contract(crssbusdAddr, pairAbi, theOwner);

    await factory.createPair(weth.address, wbnb.address);
    await network.provider.send("evm_mine");
    const wethbnbAddr = await factory.getPair(weth.address, wbnb.address)
    console.log("WETH-BNB: ", wethbnbAddr)
    wethbnb = new ethers.Contract(wethbnbAddr, pairAbi, theOwner);

    await factory.createPair(ada.address, wbnb.address);
    await network.provider.send("evm_mine");
    const adabnbAddr = await factory.getPair(ada.address, wbnb.address)
    console.log("Ada-Bnb: ", adabnbAddr)
    adabnb = new ethers.Contract(adabnbAddr, pairAbi, theOwner);


    await factory.createPair(wbnb.address, busd.address);
    await network.provider.send("evm_mine");
    const bnbbusdAddr = await factory.getPair(wbnb.address, busd.address)
    console.log("Bnb-Busd: ", bnbbusdAddr)
    bnbbusd = new ethers.Contract(bnbbusdAddr, pairAbi, theOwner);

    await factory.createPair(wbnb.address, link.address);
    await network.provider.send("evm_mine");
    const bnblinkAddr = await factory.getPair(wbnb.address, link.address)
    console.log("Bnb-Link: ", bnblinkAddr)
    bnblink = new ethers.Contract(bnblinkAddr, pairAbi, theOwner);

    await factory.createPair(btcb.address, wbnb.address);
    await network.provider.send("evm_mine");
    const btcbbnbAddr = await factory.getPair(btcb.address, wbnb.address)
    console.log("Btcb-Bnb: ", btcbbnbAddr)
    btcbbnb = new ethers.Contract(btcbbnbAddr, pairAbi, theOwner);

    await factory.createPair(busd.address, usdt.address);
    await network.provider.send("evm_mine");
    const busdusdtAddr = await factory.getPair(busd.address, usdt.address)
    console.log("Busd-usdt: ", busdusdtAddr)
    busdusdt = new ethers.Contract(busdusdtAddr, pairAbi, theOwner);

    await factory.createPair(cake.address, wbnb.address);
    await network.provider.send("evm_mine");
    const cakebnbAddr = await factory.getPair(cake.address, wbnb.address)
    console.log("Cake-Bnb: ", cakebnbAddr)
    cakebnb = new ethers.Contract(cakebnbAddr, pairAbi, theOwner);


    await factory.createPair(dot.address, wbnb.address);
    await network.provider.send("evm_mine");
    const dotbnbAddr = await factory.getPair(dot.address, wbnb.address)
    console.log("Dot-Bnb: ", dotbnbAddr)
    dotbnb = new ethers.Contract(dotbnbAddr, pairAbi, theOwner);

    await factory.createPair(crssV11.address, usdt.address);
    await network.provider.send("evm_mine");
    const crssusdtAddr = await factory.getPair(crssV11.address, usdt.address)
    console.log("Crss-usdt: ", crssusdtAddr)
    crssusdt = new ethers.Contract(crssusdtAddr, pairAbi, theOwner);

    await network.provider.send("evm_mine");

    console.log("Factory Hash: ", await factory.INIT_CODE_PAIR_HASH())
    const contracts = {
        factory,
        router,
        crssV11,
        xcrss,
        masterChef,
        busd,
        weth,
        wbnb,
        btcb,
        cake,
        dot,
        ada,
        usdt,
        link,
        crssbnb,
        crssbusd,
        crssusdt,
        dotbnb,
        cakebnb,
        btcbbnb,
        adabnb,
        busdusdt,
        bnblink,
        wethbnb,
        bnbbusd,
        trustedForwarder
    }
    return contracts;
}

function takeSanpshots(contracts) {
    let snapshots;
    return snapshots;
}

function readTransfers() {
    const transfers = []
    const fileNames = [
        'CRSSV11.json',
        'BNB_ADA.json',
        'BNB_BTCB.json',
        'BNB_BUSD.json',
        'BNB_CAKE.json',
        'BNB_DOT.json',
        'BNB_ETH.json',
        'BNB_LINK.json',
        'CRSS_BNB.json',
        'CRSS_USDT.json',
        'CRSS_BUSD.json',
        'USDT_BUSD.json',
        'XCRSS.json'
    ];
    for (let i = 0; i < fileNames.length; i++) {
        const path = `./events/${fileNames[i]}`;
        const data = fs.readFileSync(path, 'utf-8')
        const trList = JSON.parse(data);
        console.log(trList.length);
        transfers.push(...trList);

    }
    console.log("\nTotal transfers: ".green, transfers.length)
    return transfers
}

function searchExternalTxs(txs, transfers) {
    const txHashes = txs.map(tx => tx.Txhash)
    const externalHashes = []
    transfers.map(t => {
        const hash = t.transactionHash
        const index = txHashes.indexOf(hash)
        if (index < 0 && externalHashes.indexOf(hash) < 0) {
            externalHashes.push(hash)
        }
    })
    fs.writeFileSync("./_snapshot/transfer/externalTransactions.json", JSON.stringify(externalHashes))
    console.log("external Total: ", externalHashes.length)
}

async function getTransactionInBlock(block, rpc) {
    const provider = new ethers.providers.JsonRpcProvider(rpc);
    const blockData = await provider.getBlock(Number(block));
    return blockData
}

async function orderTransfers(txs, transfers, rpcProvider, filename) {
    const txHashes = txs.map(tx => tx.Txhash)
    transfers = transfers.sort((a, b) => Number(a.blockNumber) - Number(b.blockNumber));

    fs.writeFileSync(filename, "[");

    for (let i = 0; i < transfers.length; i++) {
        if (i < transfers.length - 1 && transfers[i].blockNumber == transfers[i + 1].blockNumber) {
            const blockNo = transfers[i].blockNumber;
            const lastIndex = transfers.map(o => o.blockNumber).lastIndexOf(blockNo);
            const subData = transfers.slice(i, lastIndex + 1);
            console.log("SubData: ", i, lastIndex, blockNo)
            const blockData = await getTransactionInBlock(blockNo, rpcProvider)
            subData.sort((a, b) => {
                if (a.transactionHash == b.transactionHash) {
                    return a.logIndex - b.logIndex;
                } else {
                    const aIndex = blockData.transactions.indexOf(a.transactionHash)
                    const bIndex = blockData.transactions.indexOf(b.transactionHash)
                    if (aIndex < 0 || bIndex < 0) {
                        const log = `Tx: ${blockData.number}\n${blockData.transactions}\nA: ${a.transactionHash}, ${a.blockNumber}\nB: ${b.transactionHash}, ${b.Blockno}`
                        fs.writeFileSync("order_log.txt", log);
                        throw (`Not exist in ${blockNo} block`)
                    }
                    return aIndex - bIndex
                }
            })
            for (let j = 0; j < subData.length; j++) {
                fs.appendFileSync(filename, JSON.stringify(subData[j]) + ',' + "\n");
            }
            i = lastIndex;
        } else {
            fs.appendFileSync(filename, JSON.stringify(transfers[i]) + ',' + "\n");
        }
    }

    let data = fs.readFileSync(filename, 'utf-8')
    data = data.slice(0, -1)
    fs.writeFileSync(filename, data.slice(0, -1) + "]");

    // transfers.sort((a, b) => {
    //     const aTx = a.transactionHash
    //     const bTx = b.transactionHash
    //     const aIndex = txHashes.indexOf(aTx)
    //     const bIndex = txHashes.indexOf(bTx)
    //     if (aIndex < 0 || bIndex < 0) {
    //         console.log(a, b)
    //         throw (`Error: Non registered Transfer`)
    //     }
    //     if (aTx == bTx) {
    //         return a.logIndex - b.logIndex
    //     } else {
    //         return aIndex - bIndex
    //     }
    // })
    // return transfers
}


async function getOrderedSystemTxList(startBlock, sysTxList, BoundaryTxHash, rpcProvider, filename) {
    let orderedSysTxList;

    // Sort Transaction list according to its blocknumber
    orderedSysTxList = sysTxList.sort((a, b) => Number(a.Blockno) - Number(b.Blockno));

    let startIndex = orderedSysTxList.map(o => o.Blockno).indexOf(startBlock.toString());
    if (startIndex < 0) startIndex = 0
    console.log("Start Index: ", startIndex, "To: ", orderedSysTxList.length)

    fs.writeFileSync(filename, "[");

    // Loop through list and sort ones included in same block
    for (let i = startIndex; i < orderedSysTxList.length; i++) {
        if (i < orderedSysTxList.length - 1 && orderedSysTxList[i].Blockno == orderedSysTxList[i + 1].Blockno) {
            // Get the list of transactions included in one block number, let's call it subData
            const blockNo = orderedSysTxList[i].Blockno;
            const lastIndex = orderedSysTxList.map(o => o.Blockno).lastIndexOf(blockNo);
            const subData = orderedSysTxList.slice(i, lastIndex + 1);

            // Get Blockdata of current block number
            const blockData = await getTransactionInBlock(blockNo, rpcProvider)

            // Sort Subdata
            subData.sort((a, b) => {
                const aIndex = blockData.transactions.indexOf(a.Txhash)
                const bIndex = blockData.transactions.indexOf(b.Txhash)

                // If blockdata does not have one of these tractions, throw error
                if (aIndex < 0 || bIndex < 0) {
                    const log = `Tx: ${blockData.number}\n${blockData.transactions}\nA: ${a.Txhash}, ${a.Blockno}\nB: ${b.Txhash}, ${b.Blockno}`
                    fs.writeFileSync("order_log.txt", log);
                    throw (`Not exist in ${blockNo} block`)
                }
                return aIndex - bIndex
            })

            // Save sorted result to a file
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
    fs.writeFileSync(filename, "[");
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
        console.log(orderedSysTxList[i].Txhash, method)
        fs.appendFileSync(filename, JSON.stringify(orderedSysTxList[i]) + "\n")
    }

    let data = fs.readFileSync(filename, 'utf-8')
    data = data.slice(0, -1)
    fs.writeFileSync(filename, data.slice(0, -1) + "]");
}

exports.transactionFiles = transactionFiles;
exports.getSystemTxList = getSystemTxList;
exports.deployContracts = deployContracts;
exports.takeSanpshots = takeSanpshots;
exports.readTransfers = readTransfers;
exports.orderTransfers = orderTransfers;
exports.searchExternalTxs = searchExternalTxs;
exports.getOrderedSystemTxList = getOrderedSystemTxList;
exports.populateSysTxListWithArguments = populateSysTxListWithArguments;