require("dotenv").config();
const fs = require("fs");
const axios = require('axios').default;

const tokenConstants = require('./constants.js');
const exploiterFile = require("./stakingAttackers.js")
const excludedAddresses = tokenConstants.excludedAddr
const masterchefExploiters = exploiterFile.exploiterAddresses

const Web3 = require("web3")
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
    const arr1 = await getBEP20TransferForBlocks(timestamp1, timestamp3)
    const arr2 = await getBEP20TransfersSingle(timestamp3 + 1, latest)
    const fullArray = arr1.concat(arr2)
    fs.writeFileSync("_snapshot/smartContracts/masterchefBEP20Transfers.json", JSON.stringify(fullArray))
}

const getBEP20TransferForBlocks = async (from, to) => {
    let fullArray = []
    let errorCount = 0
    let maxLogPerRequestExceeded = 0
    let emptyCount = 0
    const inner = async (_from, _to) => {
        const options = {
            method: 'GET',
            url: `https://deep-index.moralis.io/api/v2/${masterchef}/erc20/transfers?chain=bsc&from_block=${_from}&to_block=${_to}&limit=100`,
            headers: { Accept: 'application/json', 'X-API-Key': process.env.MORALIS_API }
        };


        axios
            .request(options)
            .then(function (response) {
                objectArray = (response.data).result;
                if (objectArray.length > 0) {//typeof objectArray != 'undefined' || && objectArray == null
                    fullArray = fullArray.concat(objectArray)
                } else {
                    emptyCount++;
                }
                if (objectArray.length == 100) {
                    maxLogPerRequestExceeded++
                    console.log("exceeded array length limit")

                }
            })
            .catch(function (error) {
                console.error(error);
                errorCount++
            });
    }

    for (let i = from; i < to; i += 31) {
        await inner(i, i + 30)
        await delay(0.2)

    }

    console.log(`Number of empty array responses:${emptyCount}`)
    console.log(`Request array length exceeded ${maxLogPerRequestExceeded} times`)
    console.log(`Error count:${errorCount}`)
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
            objectArray = (response.data).result;
            if (objectArray.length > 0) {//typeof objectArray != 'undefined' || && objectArray == null
                fullArray = objectArray
            }
            if (objectArray.length == 100) {

                console.log("exceeded array length limit")

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
    let arr1 = []
    for (let i = 0; i < tokenTransfers.length; i++) {
        if (tokenTransfers[i].from_address == masterchef && tokenTransfers[i].address == crssTokenAddress) {
            arr1.push(tokenTransfers[i])
        }
    }
    fs.writeFileSync("_snapshot/smartContracts/withdrawFilteredBEP20Transfers.json", JSON.stringify(arr1))

    let arr2 = []
    for (let i = 0; i < tokenTransfers.length; i++) {
        if (tokenTransfers[i].to_address == masterchef && tokenTransfers[i].address == crssTokenAddress) {
            arr2.push(tokenTransfers[i])
        }
    }
    fs.writeFileSync("_snapshot/smartContracts/depositFilteredBEP20Transfers.json", JSON.stringify(arr2))
}

const getAllTransferLogsWithdraw = async () => {
    let emptyCount = 0;
    let fullArray = []
    let errorCount = 0
    let maxLogPerRequestExceeded = 0
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
                if (objectArray.length > 0) {//typeof objectArray != 'undefined' || && objectArray == null
                    fullArray = fullArray.concat(objectArray)
                } else {
                    emptyCount++;
                }
                if (objectArray.length == 100) {
                    maxLogPerRequestExceeded++
                    console.log("exceeded array length limit")

                }
            })
            .catch(function (error) {
                console.error(error);
                errorCount++
            });

    }
    const loop = async (_from, _to, _skip) => {
        for (let i = _from; i < _to; i += _skip + 1) {//14486353
            await inner(i, i + _skip)
            await delay(0.25)

        }
    }
    await loop(timestamp1, timestamp2, 200);
    await loop(timestamp2, timestamp3, 500);
    await loop(timestamp3, latest, latest - timestamp3 - 1)
    console.log(`Number of empty array responses:${emptyCount}`)
    console.log(`Request array length exceeded ${maxLogPerRequestExceeded} times`)
    console.log(`Error count:${errorCount}`)
    fs.writeFileSync("_snapshot/smartContracts/masterchefWithdrawTransferLogs.json", JSON.stringify(fullArray))
}
const getAllTransferLogsEmergencyWithdraw = async () => {
    let emptyCount = 0;
    let fullArray = []
    let errorCount = 0
    let maxLogPerRequestExceeded = 0
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
                if (objectArray.length > 0) {//typeof objectArray != 'undefined' || && objectArray == null
                    fullArray = fullArray.concat(objectArray)
                } else {
                    emptyCount++;
                }
                if (objectArray.length == 100) {
                    maxLogPerRequestExceeded++
                    console.log("exceeded array length limit")
                }
            })
            .catch(function (error) {
                console.error(error);
                errorCount++

            });

    }
    const loop = async (_from, _to, _skip) => {
        for (let i = _from; i < _to; i += _skip + 1) {//14486353
            await inner(i, i + _skip)
            await delay(0.25)

        }
    }
    await loop(timestamp1, timestamp2, 300);
    await loop(timestamp2, timestamp3, 800);
    await loop(timestamp3, latest, latest - timestamp3 - 1)
    console.log(`Number of empty array responses:${emptyCount}`)
    console.log(`Request array length exceeded ${maxLogPerRequestExceeded} times`)
    console.log(`Error count:${errorCount}`)
    fs.writeFileSync("_snapshot/smartContracts/masterchefEmergencyWithdrawTransferLogs.json", JSON.stringify(fullArray))
}
const getAllTransferLogsDeposit = async () => {
    let emptyCount = 0;
    let fullArray = []
    let errorCount = 0
    let maxLogPerRequestExceeded = 0
    const latest = await web3.eth.getBlockNumber()
    const inner = async (_fromBlock, _toBlock) => {
        let objectArray = []
        const options = {
            method: 'GET',
            url: `https://deep-index.moralis.io/api/v2/0x70873211CB64c1D4EC027Ea63A399A7d07c4085B/logs?chain=bsc&from_block=${_fromBlock}&to_block=${_toBlock}&topic0=${depositTopic}&limit=100`,
            headers: { Accept: 'application/json', 'X-API-Key': process.env.MORALIS_API }
        }
        axios
            .request(options)
            .then(function (response) {
                objectArray = (response.data).result;
                if (objectArray.length > 0) {//typeof objectArray != 'undefined' || && objectArray == null
                    fullArray = fullArray.concat(objectArray)
                } else {
                    emptyCount++;
                }
                if (objectArray.length == 100) {
                    maxLogPerRequestExceeded++
                    console.log("exceeded array length limit")
                }
            })
            .catch(function (error) {
                console.error(error);
                errorCount++

            });

    }
    const loop = async (_from, _to, _skip) => {
        for (let i = _from; i < _to; i += _skip + 1) {//14486353
            await inner(i, i + _skip)
            await delay(0.25)

        }
    }
    await loop(timestamp1, timestamp2, 200);
    await loop(timestamp2, timestamp3, 500);
    await loop(timestamp3, latest, latest - timestamp3 - 1)
    console.log(`Number of empty array responses:${emptyCount}`)
    console.log(`Request array length exceeded ${maxLogPerRequestExceeded} times`)
    console.log(`Error count:${errorCount}`)
    fs.writeFileSync("_snapshot/smartContracts/masterchefDepositTransferLogs.json", JSON.stringify(fullArray))
};

function getWithdrawLogTransferHashes() {
    const logs1 = require("../_snapshot/smartContracts/masterchefEmergencyWithdrawTransferLogs.json")
    const logs2 = require("../_snapshot/smartContracts/masterchefWithdrawTransferLogs.json")
    let newArr = []

    for (let i = 0; i < logs1.length; i++) {
        newArr.push(logs1[i].transaction_hash)
    }
    for (let i = 0; i < logs2.length; i++) {
        newArr.push(logs2[i].transaction_hash)
    }
    fs.writeFileSync("_snapshot/smartContracts/masterchefWithdrawLogHashes.json", JSON.stringify(newArr))

}
function getDepositLogTransferHashes() {
    const logs = require("../_snapshot/smartContracts/masterchefDepositTransferLogs.json")
    let newArr = []

    for (let i = 0; i < logs.length; i++) {
        newArr.push(logs[i].transaction_hash)
    }
    fs.writeFileSync("_snapshot/smartContracts/masterchefDepositLogHashes.json", JSON.stringify(newArr))

}
function filterWithdrawsWithHashes() {
    const arr = require("../_snapshot/smartContracts/withdrawFilteredBEP20Transfers.json")
    const logs = require("../_snapshot/smartContracts/masterchefWithdrawLogHashes.json")
    let newArr = []
    console.log(`Starting amount of objectArrays: ${arr.length}`)
    for (let i = 0; i < arr.length; i++) {

        if (logs.includes(arr[i].transaction_hash)) {
            arr[i].value /= (10 ** 18)
            newArr.push(arr[i])

        }
    }
    console.log(`New amount of objectArrays: ${newArr.length}`)
    fs.writeFileSync("_snapshot/smartContracts/hashFilteredWithdraws.json", JSON.stringify(newArr))
}
function filterDepositsWithHashes() {
    const arr = require("../_snapshot/smartContracts/depositFilteredBEP20Transfers.json")
    const logs = require("../_snapshot/smartContracts/masterchefDepositLogHashes.json")
    let newArr = []
    console.log(`Starting amount of objectArrays: ${arr.length}`)
    for (let i = 0; i < arr.length; i++) {

        if (logs.includes(arr[i].transaction_hash)) {
            arr[i].value /= (10 ** 18)
            newArr.push(arr[i])

        }
    }
    console.log(`New amount of objectArrays: ${newArr.length}`)
    fs.writeFileSync("_snapshot/smartContracts/hashFilteredDeposits.json", JSON.stringify(newArr))
}





function getUserStakingAfterAttack() {
    const filteredWithdraws = require("../_snapshot/smartContracts/hashFilteredWithdraws.json")
    const filteredDeposits = require("../_snapshot/smartContracts/hashFilteredDeposits.json")
    let userArray = []
    let addrArray = []
    const exploiterAddresses = masterchefExploiters

    for (let i = 0; i < filteredWithdraws.length; i++) {
        if (!exploiterAddresses.includes(filteredWithdraws[i].to_address)) {
            const crssAmount = filteredWithdraws[i].value
            if (addrArray.includes(filteredWithdraws[i].to_address)) {
                const index = addrArray.indexOf(filteredWithdraws[i].to_address)
                userArray[index].crssAdjustment += crssAmount
            } else {
                let userObject = { "address": filteredWithdraws[i].to_address, "crssAdjustment": crssAmount }
                userArray.push(userObject)
                addrArray.push(filteredWithdraws[i].to_address)
            }

        }

    }

    for (let i = 0; i < filteredDeposits.length; i++) {
        const crssAmount = filteredDeposits[i].value
        if (addrArray.includes(filteredDeposits[i].from_address)) {
            const index = addrArray.indexOf(filteredDeposits[i].from_address)
            userArray[index].crssAdjustment -= crssAmount
        } else {
            let userObject = { "address": filteredDeposits[i].from_address, "crssAdjustment": -crssAmount }
            userArray.push(userObject)
            addrArray.push(filteredDeposits[i].from_address)
        }
    }
    const checkedArray = checkForExcludedAddresses(userArray)
    checkedArray.sort(sort_by('crssAdjustment', true, parseInt));

    console.log(`Total addresses adjusted: ${checkedArray.length}`)
    fs.writeFileSync("_snapshot/smartContracts/crssWithdrawnAfterAttack.json", JSON.stringify(checkedArray))
}


function calculateTotalAdjustment() {

    const stakingArr = require("../_snapshot/smartContracts/usersCRSSStaked.json")
    const adjustmentArr = require("../_snapshot/smartContracts/crssWithdrawnAfterAttack.json")
    let addrArray = []
    let userArray = []
    let adjustedArray = []

    let totalStakingOwed = 0
    for (let i = 0; i < stakingArr.length; i++) {
        const userObject = { "address": stakingArr[i].address, "crssOwed": stakingArr[i].crssOwed }
        userArray.push(userObject)
        addrArray.push(userObject.address)
    }

    for (let i = 0; i < adjustmentArr.length; i++) {
        const crssAmount = adjustmentArr[i].crssAdjustment
        if (addrArray.includes(adjustmentArr[i].address)) {
            const index = addrArray.indexOf(adjustmentArr[i].address)
            userArray[index].crssOwed += crssAmount
        } else {
            let userObject = { "address": adjustmentArr[i].address, "crssOwed": crssAmount }
            userArray.push(userObject)
            addrArray.push(adjustmentArr[i].address)
        }
    }


    const checkedArray = checkForExcludedAddresses(userArray)


    for (let i = 0; i < checkedArray.length; i++) {

        if (checkedArray[i].crssOwed > 0) {
            adjustedArray.push(checkedArray[i])
        }

    }
    for (let i = 0; i < adjustedArray.length; i++) {
        totalStakingOwed += adjustedArray[i].crssOwed
    }
    adjustedArray.sort(sort_by('crssOwed', true, parseInt));
    console.log(`Total CRSS owed for staking: ${totalStakingOwed}`)
    console.log(`Total addresses in staking: ${adjustedArray.length}`)
    fs.writeFileSync("_snapshot/smartContracts/totalAdjustedStaking.json", JSON.stringify(adjustedArray))

}
/*function applyAdjustment() {
    let stakingArr = require("../_snapshot/smartContracts/usersCRSSStaked.json")
    const adjustmentArr = require("../_snapshot/smartContracts/stakingV1.json")
    let totalAdjusted = 0
    let addrArray = []
    let userArray = []

    let totalStakingOwed = 0

    for (let i = 0; i < adjustmentArr.length; i++) {
        const crssAmount = adjustmentArr[i].crssOwed
        const userAddress = adjustmentArr[i].address
        if (addrArray.includes(userAddress)) {
            const index = addrArray.indexOf(userAddress)
            userArray[index].crssOwed += crssAmount
        } else {
            let userObject = { "address": userAddress, "crssOwed": crssAmount }
            userArray.push(userObject)
            addrArray.push(userAddress)
        }
    }

    for (let i = 0; i < userArray.length; i++) {
        const adjustmentValue = userArray[i].crssOwed
        const adjustmentAddress = userArray[i].address
        let exists = false
        for (let x = 0; x < stakingArr.length; x++) {
            if (stakingArr[x].address == adjustmentAddress) {
                stakingArr[x].crssOwed += adjustmentValue
                totalAdjusted += adjustmentValue
                console.log(`Done with ${[i]} for ${adjustmentAddress}`)
                exists = true
                break
            }

        }
        if (exists === false) {
            stakingArr.push(userArray[i])
        }



    }

    const checkedArray = checkForExcludedAddresses(stakingArr)
    checkedArray.sort(sort_by('crssOwed', true, parseInt));
    for (let i = 0; i < checkedArray.length; i++) {
        totalStakingOwed += checkedArray[i].crssOwed
    }
    console.log(`Total staking: ${totalStakingOwed}`)
    fs.writeFileSync("_snapshot/smartContracts/stakingV1.json", JSON.stringify(checkedArray))
}
function calculateAllCRSSTransfers() {
    const tokenTransfers = require("../_snapshot/smartContracts/masterchefBEP20Transfers.json")
    let totalAdjusted = 0
    let addrArray = []
    let userArray = []

    let totalStakingOwed = 0

    for (let i = 0; i < tokenTransfers.length; i++) {
        const crssAmount = tokenTransfers[i].value / 10 ** 18
        if (addrArray.includes(tokenTransfers[i].to_address)) {
            const index = addrArray.indexOf(tokenTransfers[i].to_address)
            userArray[index].crssOwed += crssAmount
        } else {
            let userObject = { "address": tokenTransfers[i].to_address, "crssOwed": crssAmount }
            userArray.push(userObject)
            addrArray.push(tokenTransfers[i].to_address)
        }
    }
    for (let i = 0; i < tokenTransfers.length; i++) {
        const crssAmount = tokenTransfers[i].value / 10 ** 18
        if (addrArray.includes(tokenTransfers[i].from_address)) {
            const index = addrArray.indexOf(tokenTransfers[i].from_address)
            userArray[index].crssOwed -= crssAmount
        } else {
            let userObject = { "address": tokenTransfers[i].from_address, "crssOwed": crssAmount }
            userArray.push(userObject)
            addrArray.push(tokenTransfers[i].from_address)
        }
    }

    const checkedArray = checkForExcludedAddresses(userArray)
    checkedArray.sort(sort_by('crssOwed', true, parseInt));
    for (let i = 0; i < checkedArray.length; i++) {
        totalStakingOwed += checkedArray[i].crssOwed
    }
    console.log(`Total staking: ${totalStakingOwed}`)
    fs.writeFileSync("_snapshot/smartContracts/stakingAdjustmentV1.json", JSON.stringify(checkedArray))
}*/
function checkForExcludedAddresses(arr = []) {
    let checkedArray = []
    for (let i = 0; i < arr.length; i++) {
        let excluded = false;
        const userAddress = arr[i].address.toLowerCase()
        for (let x = 0; x < excludedAddresses.length; x++) {
            if (userAddress == excludedAddresses[x]) {
                excluded = true
                console.log("Found excluded address")
            }
        }

        if (excluded == false) {
            checkedArray.push(arr[i])
        }

    }
    return checkedArray
}

function orderAndCalculate() {
    filterTokenTransfers()
    getWithdrawLogTransferHashes()
    getDepositLogTransferHashes()
    filterWithdrawsWithHashes()
    filterDepositsWithHashes()
    getUserStakingAfterAttack()
    calculateTotalAdjustment()
}
const gatherLogsAndBEP20Transfers = async () => {



    await getBEP20Transfers()
    await getAllTransferLogsEmergencyWithdraw()
    await getAllTransferLogsWithdraw()
    await getAllTransferLogsDeposit()
    orderAndCalculate()





}
gatherLogsAndBEP20Transfers()

