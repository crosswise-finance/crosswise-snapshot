require("dotenv").config();
const fs = require("fs");
const axios = require('axios').default;
const abiDecoder = require('abi-decoder');

const Web3 = require("web3")
const masterchefAbi = require("../_supporting/abi_masterchef.json");
const masterchef = "0x70873211CB64c1D4EC027Ea63A399A7d07c4085B".toLowerCase()
const crssTokenAddress = "0x99FEFBC5cA74cc740395D65D384EDD52Cb3088Bb".toLowerCase();
//const dataToDecode = require("../_snapshot/smartContracts/temp2.json")

const web3 = new Web3(new Web3.providers.HttpProvider('https://bsc-dataseed2.defibit.io/'))
//const contract = new web3.eth.Contract(masterchefAbi, masterchef);
//topic used to filter relevant events
const depositTopic = "0x90890809c654f11d6e72a28fa60149770a0d11ec6c92319d6ceb2bb0a4ea1a15";
const withdrawTopic = "0xf279e6a1f5e320cca91135676d9cb6e44ca8a08c0b88342bcdb1144f6511b568";
const emergencyWithdrawTopic = "0xbb757047c2b5f3974fe26b7c10f732e7bce710b0952a71082702781e62ae0595";
const topic1d = "0x0000000000000000000000009618ce1cf75f0d9090325ba4c26a0e782f4ea7ad";//pid 0 parameter topic for deposit event
const topic1w = "0x0000000000000000000000000e9b358cbc14c7a54441765438a0d37edef58caf";//pid 0 topic for withdraw event
const topic1ew = "0x00000000000000000000000022216a348647a297089970dfad28064babf01495"//pid 0 topic for emergency withdraw event

//const transferLogs = JSON.parse(transfertransferLogs)
//exact blocks used as time parameters
const timestamp1 = 14465247 //6:07:59 AM UTC, 18.1.2022 (bscscan)
const timestamp2 = 14486353 //11:59:58 PM UTC, 18.1.2022 (bscscan)
const timestamp3 = 14522847 //48h after timestamp 1

//we need this to create space between Api Pro requests to avoid missing data, since the relevant ones are capped to 2 calls per second
function delay(n) {
    return new Promise(function (resolve) {
        setTimeout(resolve, n * 1000);
    });
}

//this is a helper function for sorting addresses with descending balance value
const sort_by = (field, reverse, primer) => {

    const key = primer ?
        function (x) {
            return primer(x[field])
        } :
        function (x) {
            return x[field]
        };

    reverse = !reverse ? 1 : -1;

    return function (a, b) {
        return a = key(a), b = key(b), reverse * ((a > b) - (b > a));
    }
}
const getBEP20Transfers = async () => {
    const latest = await web3.eth.getBlockNumber()
    const arr1 = await getBEP20TransferForBlocks(14465247, 14522847)
    const arr2 = await getBEP20TransfersSingle(14522847, latest)
    const fullArray = arr1.concat(arr2)
    fs.writeFileSync("_snapshot/smartContracts/masterchefBEP20Transfers.json", JSON.stringify(fullArray))
}

const getBEP20TransferForBlocks = async (from, to) => {
    let fullArray = []
    const inner = async (_from, _to) => {
        const options = {
            method: 'GET',
            url: `https://deep-index.moralis.io/api/v2/${masterchef}/erc20/transfers?chain=bsc&from_block=${_from}&to_block=${_to}&limit=100`,
            headers: { Accept: 'application/json', 'X-API-Key': process.env.MORALIS_API }
        };


        axios
            .request(options)
            .then(function (response) {
                const objectArray = (response.data).result;
                if (objectArray.length != 0) {
                    fullArray = fullArray.concat(objectArray)
                }
            })
            .catch(function (error) {
                console.error(error);
            });
    }
    for (let i = from; i < to; i += 20) {
        await inner(i, i + 20)
        await delay(0.2)

    }
    return fullArray
}
const getBEP20TransfersSingle = async (_from, _to) => {
    let fullArray = []
    const options = {
        method: 'GET',
        url: `https://deep-index.moralis.io/api/v2/${masterchef}/erc20/transfers?chain=bsc&from_block=${_from}&to_block=${_to}&limit=100`,
        headers: { Accept: 'application/json', 'X-API-Key': process.env.MORALIS_API }
    };

    axios
        .request(options)
        .then(function (response) {
            const objectArray = ((response.data).result)
            if (objectArray.length != 0) {
                fullArray = fullArray.concat(objectArray)

            }
        })
        .catch(function (error) {
            console.error(error);
        });
    return fullArray
}

//here we filter out bep20 token transfers, we are filtering each address that sent tokens to masterchef contract address, since this is true for every deposit 
//we filter out each address with value sent above 10 CRSS, to get rid of automatic inter contract interaction
//we also filter each address that sent CRSS token as value, since staking and PID 0 pools in general work only with CRSS
function filterTokenTransfers() {
    const tokenTransfers = require("../_snapshot/smartContracts/masterchefBEP20Transfers.json")
    let arr = []
    for (let i = 0; i < tokenTransfers.length; i++) {
        if (tokenTransfers[i].from_address == masterchef && tokenTransfers[i].value >= 10 * (10 ** 18) && tokenTransfers[i].address == crssTokenAddress) {
            arr.push(tokenTransfers[i])
        }
    }
    fs.writeFileSync("_snapshot/smartContracts/withdrawFilteredBEP20Transfers.json", JSON.stringify(arr))
}
//this is where we get all event logs from one block after the attack, filtered by deposit topic value in order to get staking and deposit(pid0) functions exclusively
const getAllTransferLogs1 = async () => {
    let emptyCount = 0;
    const latest = await web3.eth.getBlockNumber()
    const inner = async (_fromBlock, _toBlock) => {
        let objectArray = []
        const options = {
            method: 'GET',
            url: `https://deep-index.moralis.io/api/v2/0x70873211CB64c1D4EC027Ea63A399A7d07c4085B/logs?chain=bsc&from_block=${_fromBlock}&to_block=${_toBlock}&topic0=0x90890809c654f11d6e72a28fa60149770a0d11ec6c92319d6ceb2bb0a4ea1a15&limit=100`,
            headers: { Accept: 'application/json', 'X-API-Key': process.env.MORALIS_API }
        };

        axios
            .request(options)
            .then(function (response) {
                objectArray = (response.data).result;
                console.log(objectArray)
                if (objectArray.length > 0) {//typeof objectArray != 'undefined' || && objectArray == null
                    const stringified = JSON.stringify(objectArray).slice(1, -1)
                    fs.appendFileSync("_snapshot/smartContracts/masterchefTransferLogs.json", stringified + ",");
                } else {
                    emptyCount++;
                }
            })
            .catch(function (error) {
                console.error(error);
            });

    }
    const loop = async (_from, _to, _skip) => {
        for (let i = _from; i < _to; i += _skip) {//14486353
            await inner(i, i + _skip)
            await delay(0.25)

        }
    }
    await loop(timestamp1, timestamp2, 20);
    await loop(timestamp2, timestamp3, 50);
    await loop(timestamp3, latest, 20000)
    console.log(emptyCount)
}
const getAllTransferLogsWithdraw = async () => {
    let emptyCount = 0;
    let fullArray = []
    const latest = await web3.eth.getBlockNumber()
    const inner = async (_fromBlock, _toBlock) => {
        let objectArray = []
        const options = {
            method: 'GET',
            url: `https://deep-index.moralis.io/api/v2/0x70873211CB64c1D4EC027Ea63A399A7d07c4085B/logs?chain=bsc&from_block=${_fromBlock}&to_block=${_toBlock}&topic0=${withdrawTopic}&limit=100`,
            headers: { Accept: 'application/json', 'X-API-Key': process.env.MORALIS_API }
        };

        axios
            .request(options)
            .then(function (response) {
                objectArray = (response.data).result;
                console.log(objectArray)
                if (objectArray.length > 0) {//typeof objectArray != 'undefined' || && objectArray == null
                    fullArray = fullArray.concat(objectArray)
                } else {
                    emptyCount++;
                }
            })
            .catch(function (error) {
                console.error(error);
            });

    }
    const loop = async (_from, _to, _skip) => {
        for (let i = _from; i < _to; i += _skip) {//14486353
            await inner(i, i + _skip)
            await delay(0.25)

        }
    }
    await loop(timestamp1, timestamp2, 60);
    await loop(timestamp2, timestamp3, 120);
    await loop(timestamp3, latest, 100000)
    console.log(emptyCount)
    fs.writeFileSync("_snapshot/smartContracts/masterchefWithdrawTransferLogs.json", JSON.stringify(fullArray))
}
const getAllTransferLogsEmergencyWithdraw = async () => {
    let emptyCount = 0;
    let fullArray = []
    const latest = await web3.eth.getBlockNumber()
    const inner = async (_fromBlock, _toBlock) => {
        let objectArray = []
        const options = {
            method: 'GET',
            url: `https://deep-index.moralis.io/api/v2/0x70873211CB64c1D4EC027Ea63A399A7d07c4085B/logs?chain=bsc&from_block=${_fromBlock}&to_block=${_toBlock}&topic0=${emergencyWithdrawTopic}&limit=100`,
            headers: { Accept: 'application/json', 'X-API-Key': process.env.MORALIS_API }
        };

        axios
            .request(options)
            .then(function (response) {
                objectArray = (response.data).result;
                console.log(objectArray)
                if (objectArray.length > 0) {//typeof objectArray != 'undefined' || && objectArray == null
                    fullArray = fullArray.concat(objectArray)
                } else {
                    emptyCount++;
                }
            })
            .catch(function (error) {
                console.error(error);
            });

    }
    const loop = async (_from, _to, _skip) => {
        for (let i = _from; i < _to; i += _skip) {//14486353
            await inner(i, i + _skip)
            await delay(0.25)

        }
    }
    await loop(timestamp1, timestamp2, 500);
    await loop(timestamp2, timestamp3, 1000);
    await loop(timestamp3, latest, 100000)
    console.log(emptyCount)
    fs.writeFileSync("_snapshot/smartContracts/masterchefEmergencyWithdrawTransferLogs.json", JSON.stringify(fullArray))
}
function getAllLogTransferHashes() {
    //const arr = require("../_snapshot/smartContracts/afterAttackFiltered.json")
    const logs1 = require("../_snapshot/smartContracts/masterchefEmergencyWithdrawTransferLogs.json")
    const logs2 = require("../_snapshot/smartContracts/masterchefWithdrawTransferLogs.json")
    let newArr = []
    for (i = 0; i < logs1.length; i++) {
        newArr.push(logs1[i].transaction_hash)
    }
    for (i = 0; i < logs2.length; i++) {
        newArr.push(logs2[i].transaction_hash)
    }
    fs.writeFileSync("_snapshot/smartContracts/masterchefWithdrawLogHashes.json", JSON.stringify(newArr))

}
function filterWithRelevantHashes() {
    const arr = require("../_snapshot/smartContracts/withdrawFilteredBEP20Transfers.json")
    const logs = require("../_snapshot/smartContracts/masterchefWithdrawLogHashes.json")
    let newArr = []
    console.log(`Starting amount of objectArrays: ${arr.length}`)
    for (let i = 0; i < arr.length; i++) {

        if (logs.includes(arr[i].transaction_hash)) {
            newArr.push(arr[i])

        }
    }
    console.log(`New amount of objectArrays: ${newArr.length}`)
    fs.writeFileSync("_snapshot/smartContracts/hashFilteredWithdrawBEP20Transfers.json", JSON.stringify(newArr))
}


const getTransactionFromHash = async (hash) => {
    const options = {
        method: 'GET',
        url: `https://deep-index.moralis.io/api/v2/transaction/${hash}?chain=bsc`,
        headers: { Accept: 'application/json', 'X-API-Key': 'test' }
    };

    axios
        .request(options)
        .then(function (response) {
            console.log(response.data);
        })
        .catch(function (error) {
            console.error(error);
        });

}
function decodeData(data) {
    abiDecoder.addABI(masterchefAbi);
    const testData = "0x000000000000000000000000000000000000000000000000b364dacf24951726";
    const decodedData = abiDecoder.decodeMethod(testData);
    //const result = web3.utils.hexToNumberString(data);
    // get staking value in crss
    const result = web3.utils.hexToNumberString("0x000000000000000000000000000000000000000000000000b364dacf24951726")
    console.log(result)
}
const getActivityAfterAttack = async (fromBlock, toBlock, topic0, topic1) => {


    const options = {
        method: 'GET',
        url: `https://deep-index.moralis.io/api/v2/${masterchef}/transferLogs?chain=bsc&from_block=${fromBlock}&to_block=${toBlock}&topic0=${topic0}&topic1=${topic1}&limit=99`,
        headers: { Accept: 'application/json', 'X-API-Key': process.env.MORALIS_API }
    };


    axios
        .request(options)
        .then(function (response) {
            const responseData = response.data;
            const arr = responseData.result;

            fs.appendFileSync("_snapshot/smartContracts/afterAttackStaking.json", JSON.stringify(arr))
            console.log(arr);
        })
        .catch(function (error) {
            console.error(error);
        });
}


function getUserStakingAfterAttack() {
    const filteredTransfers = require("../_snapshot/smartContracts/hashFilteredWithdrawBEP20Transfers.json")
    let withdrawnAfterAttack = 0
    let userArray = []

    for (let i = 0; i < filteredTransfers.length; i++) {
        let userObject = { "address": filteredTransfers[i].to_address, "afterAttackStaked": ((filteredTransfers[i].value) / (10 ** 18)) }
        userArray.push(userObject)
        withdrawnAfterAttack += userObject.afterAttackStaked
    }
    userArray.sort(sort_by('afterAttackStaked', true, parseInt));
    console.log(`Total withdrawn after attack: ${withdrawnAfterAttack}`)
    fs.writeFileSync("_snapshot/smartContracts/withdrawStakingBalanceChange.json", JSON.stringify(userArray))
}






/* for (let i = 0; i < filteredTransfers; i++) {
     let userObject = { "address": filteredTransfers[i].from_address, "afterAttackStaked": ((filteredTransfers[i].value) / (10 ** 18)) }
     if (userArray.includes(filteredTransfers[i].address)){
 
     }
 }*/




function calculateWithdrawAndDeposit() {
    //const stakingArr = require("../_snapshot/smartContracts/depositAdjustedStaking.json")

    const stakingArr = require("../_snapshot/smartContracts/stakingBalanceChange.json")
    const adjustmentArr = require("../_snapshot/smartContracts/withdrawStakingBalanceChange.json")
    let totalAdjusted = 0

    for (let i = 0; i < adjustmentArr.length; i++) {
        const adjustmentValue = adjustmentArr[i].afterAttackStaked
        const adjustmentAddress = adjustmentArr[i].address
        for (let x = 0; x < stakingArr.length; x++) {
            if (stakingArr[x].address == adjustmentAddress) {
                if (stakingArr[x].afterAttackStaked >= adjustmentValue) {
                    stakingArr[x].afterAttackStaked -= adjustmentValue
                    totalAdjusted += adjustmentValue
                }
                else { stakingArr[x].afterAttackStaked = 0 }
                console.log(`Done with ${[i]} for ${adjustmentAddress}`)
            }

        }



    }

    stakingArr.sort(sort_by('afterAttackStaked', true, parseInt));
    console.log(`Total adjusted: ${totalAdjusted}`)
    fs.writeFileSync("_snapshot/smartContracts/totalAdjustedStaking.json", JSON.stringify(stakingArr))
}
function applyAdjustment() {
    const stakingArr = require("../_snapshot/smartContracts/usersCRSSStaked.json")
    const adjustmentArr = require("../_snapshot/smartContracts/totalAdjustedStaking.json")
    let totalAdjusted = 0

    for (let i = 0; i < adjustmentArr.length; i++) {
        const adjustmentValue = adjustmentArr[i].afterAttackStaked
        const adjustmentAddress = adjustmentArr[i].address
        for (let x = 0; x < stakingArr.length; x++) {
            if (stakingArr[x].address == adjustmentAddress) {
                stakingArr[x].crssOwed -= adjustmentValue
                totalAdjusted += adjustmentValue
                console.log(`Done with ${[i]} for ${adjustmentAddress}`)
            }

        }



    }

    stakingArr.sort(sort_by('crssOwed', true, parseInt));
    console.log(`Total adjusted: ${totalAdjusted}`)
    fs.writeFileSync("_snapshot/smartContracts/staking.json", JSON.stringify(stakingArr))
}


function createAllFiles() {
    //fs.writeFileSync("_snapshot/smartContracts/adjustedStaking.json", "[]")
    //fs.writeFileSync("_snapshot/smartContracts/stakingBalanceChange.json", "[]")
    //fs.writeFileSync("_snapshot/smartContracts/hashFilteredBEP20TransferLogs.json", "[]")
    // fs.writeFileSync("_snapshot/smartContracts/filteredBEP20Transfers.json", "[]")
    //fs.writeFileSync("_snapshot/smartContracts/masterchefLogHashes.json", "[]")
    fs.appendFileSync("_snapshot/smartContracts/masterchefBEP20Transfers.json", "[]")
    fs.writeFileSync("_snapshot/smartContracts/masterchefTransferLogs.json", "[]")

}
function orderAndCalculate() {
    filterTokenTransfers()
    getAllLogTransferHashes()
    filterWithRelevantHashes()
    getUserStakingAfterAttack()
    calculateWithdrawAndDeposit()
    applyAdjustment()
}
const gatherLogsAndBEP20Transfers = async () => {



    //await getBEP20Transfers()
    //await getAllTransferLogs()
    await getAllTransferLogsEmergencyWithdraw()
    await getAllTransferLogsWithdraw()
    orderAndCalculate()





}
//getUserStakingAfterAttack()
applyAdjustment()
//run the scripts, with hardhat the command would be "npx hardhat run scripts/checkMasterchefStaking.js"
//first batch of scripts to run
//createAllFiles()

//gatherLogsAndBEP20Transfers()
//second batch of scripts to run
//to proceed you need to fix the two arrays, simply make sure both arrays start like this "[{...." and end like this "...}]", remove "]" at the start and, at the end, remove "," and add "]"
//comment out createAllFiles and gatherLogsAndBEP20Transfers functions before running this ("//createAllFiles()", "gatherLogsAndBEP20Transfers()")
//remove // in front of orderAndCalculate()
//save the file and run again to calculate results







