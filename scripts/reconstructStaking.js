require("dotenv").config();
const fs = require("fs");
const axios = require('axios').default;
const Web3 = require("web3")
const tokenConstants = require('../scripts/constants');

const excludedAddresses = tokenConstants.excludedAddr
//this gets us all the token addresses involved
const tokenAddresses = tokenConstants.LPAddresses;
//this give us the names of all involved addresses (addressOfToken1 = tokenAddresses[i] => nameOfToken1 tokenNames[i])
const tokenNames = tokenConstants.LPNames;
const tokenPrices = tokenConstants.LPPrices;
const crssPrice = 1.2605653314300524;

const masterchef = "0x70873211CB64c1D4EC027Ea63A399A7d07c4085B".toLowerCase()

const depositTopic = "0x90890809c654f11d6e72a28fa60149770a0d11ec6c92319d6ceb2bb0a4ea1a15";
const withdrawTopic = "0xf279e6a1f5e320cca91135676d9cb6e44ca8a08c0b88342bcdb1144f6511b568";
const emergencyWithdrawTopic = "0xbb757047c2b5f3974fe26b7c10f732e7bce710b0952a71082702781e62ae0595";
const topic1d = "0x0000000000000000000000009618ce1cf75f0d9090325ba4c26a0e782f4ea7ad";//pid 0 parameter topic for deposit event
const topic1w = "0x0000000000000000000000000e9b358cbc14c7a54441765438a0d37edef58caf";//pid 0 topic for withdraw event
const topic1ew = "0x00000000000000000000000022216a348647a297089970dfad28064babf01495"//pid 0 topic for emergency withdraw event
const web3 = new Web3(new Web3.providers.HttpProvider('https://bsc-dataseed2.defibit.io/'))

//const transferLogs = JSON.parse(transfertransferLogs)
//exact blocks used as time parameters
const timestamp1 = 14465247 //6:07:59 AM UTC, 18.1.2022 (bscscan)
const timestamp2 = 14486353 //11:59:58 PM UTC, 18.1.2022 (bscscan)
const timestamp3 = 14522847 //48h after timestamp 1
const timestamp0 = 14280384 //creation block of MC

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
    //const latest = await web3.eth.getBlockNumber()
    const transferArray = await getBEP20TransferForBlocks(timestamp0, timestamp1)
    //const arr2 = await getBEP20TransfersSingle(timestamp3 + 1, latest)
    //const fullArray = arr1.concat(arr2)
    fs.writeFileSync("_snapshot/smartContracts/masterchefBEP20Transfers.json", JSON.stringify(transferArray))
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
    console.log("Gathering all BEP20 token transfers for Masterchef from block of contract creation to last block before attack, this might take a few mins...")

    for (let i = from; i < to; i += 151) {
        await inner(i, i + 150)
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
        if (tokenTransfers[i].from_address == masterchef) {
            arr1.push(tokenTransfers[i])
        }
    }
    fs.writeFileSync("_snapshot/smartContracts/ALLwithdrawFilteredBEP20Transfers.json", JSON.stringify(arr1))

    let arr2 = []
    for (let i = 0; i < tokenTransfers.length; i++) {
        if (tokenTransfers[i].to_address == masterchef) {
            arr2.push(tokenTransfers[i])
        }
    }
    fs.writeFileSync("_snapshot/smartContracts/ALLdepositFilteredBEP20Transfers.json", JSON.stringify(arr2))
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
    console.log("Gathering all transaction logs with withdraw function topic for Masterchef from block of contract creation to last block before attack, this might take a few mins...")
    await loop(timestamp0, timestamp1, 300);
    //await loop(timestamp2, timestamp3, 500);
    //await loop(timestamp3, latest, latest - timestamp3 - 1)
    console.log(`Number of empty array responses:${emptyCount}`)
    console.log(`Request array length exceeded ${maxLogPerRequestExceeded} times`)
    console.log(`Error count:${errorCount}`)
    fs.writeFileSync("_snapshot/smartContracts/masterchefWithdrawTransferLogs.json", JSON.stringify(fullArray))
}
const getAllTransferLogsEmergencyWithdraw = async () => {
    let emptyCount = 0;
    let errorCount = 0
    let maxLogPerRequestExceeded = 0
    const latest = await web3.eth.getBlockNumber()

    let objectArray = []
    const options = {
        method: 'GET',
        url: `https://deep-index.moralis.io/api/v2/0x70873211CB64c1D4EC027Ea63A399A7d07c4085B/logs?chain=bsc&from_block=${timestamp0}&to_block=${timestamp1}&topic0=${emergencyWithdrawTopic}&limit=100`,
        headers: { Accept: 'application/json', 'X-API-Key': process.env.MORALIS_API }
    };

    axios
        .request(options)
        .then(function (response) {
            objectArray = (response.data).result;
            if (objectArray.length == 100) {
                maxLogPerRequestExceeded++
            }
            if (objectArray.length == 0) {
                emptyCount++
            }

        })
        .catch(function (error) {
            console.error(error);
            errorCount++

        });

    console.log(`Number of empty array responses:${emptyCount}`)
    console.log(`Request array length exceeded ${maxLogPerRequestExceeded} times`)
    console.log(`Error count:${errorCount}`)
    fs.writeFileSync("_snapshot/smartContracts/masterchefEmergencyWithdrawTransferLogs.json", JSON.stringify(objectArray))
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
    console.log("Gathering all transaction logs with deposit function topic for Masterchef from block of contract creation to last block before attack, this might take a few mins...")
    await loop(timestamp0, timestamp1, 300);
    //await loop(timestamp2, timestamp3, 500);
    // await loop(timestamp3, latest, latest - timestamp3 - 1)
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
    const arr = require("../_snapshot/smartContracts/ALLwithdrawFilteredBEP20Transfers.json")
    const logs = require("../_snapshot/smartContracts/masterchefWithdrawLogHashes.json")
    let newArr = []
    console.log(`Amount of unchecked BEP20 transfers: ${arr.length}`)
    for (let i = 0; i < arr.length; i++) {

        if (logs.includes(arr[i].transaction_hash)) {
            newArr.push(arr[i])

        }
    }
    console.log(`Filtered out ${newArr.length} withdraws with transfer log hashes`)
    fs.writeFileSync("_snapshot/smartContracts/ALLhashFilteredWithdraws.json", JSON.stringify(newArr))
}
function filterDepositsWithHashes() {
    const arr = require("../_snapshot/smartContracts/ALLdepositFilteredBEP20Transfers.json")
    const logs = require("../_snapshot/smartContracts/masterchefDepositLogHashes.json")
    let newArr = []
    console.log(`Amount of unchecked BEP20 transfers: ${arr.length}`)
    for (let i = 0; i < arr.length; i++) {

        if (logs.includes(arr[i].transaction_hash)) {
            newArr.push(arr[i])

        }
    }
    console.log(`Filtered out ${newArr.length} deposits with transfer log hashes`)
    fs.writeFileSync("_snapshot/smartContracts/ALLhashFilteredDeposits.json", JSON.stringify(newArr))
}


function checkForExcludedAddresses(arr = []) {
    let checkedArray = []
    let numberOfExcluded = 0
    for (let i = 0; i < arr.length; i++) {
        let excluded = false;
        const userAddress = arr[i].address.toLowerCase()
        for (let x = 0; x < excludedAddresses.length; x++) {
            if (userAddress == excludedAddresses[x]) {
                excluded = true
                numberOfExcluded++

            }
        }

        if (excluded == false && arr[i].crssOwed >= 0) {
            checkedArray.push(arr[i])
        }

    }
    console.log(`Found ${numberOfExcluded} excluded addresses`)
    return checkedArray
}


function getUserStakingBeforeAttack() {
    const filteredWithdraws = require("../_snapshot/smartContracts/ALLhashFilteredWithdraws.json")
    const filteredDeposits = require("../_snapshot/smartContracts/ALLhashFilteredDeposits.json")
    let userArray = []
    let addrArray = []
    let uniqueTokenAddresses = []
    let included = 0
    let notIncluded = 0

    for (let i = 0; i < filteredWithdraws.length; i++) {
        const userAddress = filteredWithdraws[i].to_address


        for (let x = 0; x < tokenAddresses.length; x++) {
            const tokenAddress = filteredWithdraws[i].address
            if (!uniqueTokenAddresses.includes(tokenAddress)) {
                uniqueTokenAddresses.push(tokenAddress)
            }
            if (tokenAddresses[x].toLowerCase() == tokenAddress) {

                const tokenAmount = filteredWithdraws[i].value / (10 ** 18)
                const crssAmountEquivalent = tokenPrices[x] * tokenAmount / crssPrice
                const propertyName = tokenNames[x]
                if (addrArray.includes(userAddress)) {
                    const index = addrArray.indexOf(userAddress)
                    userArray[index][propertyName] -= tokenAmount
                    userArray[index].crssOwed -= crssAmountEquivalent
                    included++
                } else {
                    notIncluded++
                    let userObject = {
                        "address": userAddress, "CRSSV11": 0, "CRSS_BUSD": 0, "CRSS_BNB": 0,
                        "BNB_BUSD": 0, "BNB_USDC": 0, "BNB_DOT": 0,
                        "BNB_LINK": 0, "BNB_ETH": 0, "BNB_ADA": 0, "BNB_BTCB": 0, "BUSD_USDC": 0, "BNB_CAKE": 0, "crssOwed": 0
                    }
                    userObject[propertyName] -= tokenAmount
                    userObject.crssOwed -= crssAmountEquivalent
                    // let userObject = { "address": userAddress, "crssAdjustment": crssAmount }
                    userArray.push(userObject)
                    addrArray.push(userAddress)
                }

            }
        }



    }

    for (let i = 0; i < filteredDeposits.length; i++) {
        const userAddress = filteredDeposits[i].from_address


        for (let x = 0; x < tokenAddresses.length; x++) {
            const tokenAddress = filteredDeposits[i].address
            if (!uniqueTokenAddresses.includes(tokenAddress)) {
                uniqueTokenAddresses.push(tokenAddress)
            }
            if (tokenAddresses[x].toLowerCase() == tokenAddress) {
                const tokenAmount = filteredDeposits[i].value / (10 ** 18)
                const crssAmountEquivalent = tokenPrices[x] * tokenAmount / crssPrice
                const propertyName = tokenNames[x]
                if (addrArray.includes(userAddress)) {
                    const index = addrArray.indexOf(userAddress)
                    userArray[index][propertyName] += tokenAmount
                    userArray[index].crssOwed += crssAmountEquivalent
                    included++
                } else {
                    notIncluded++
                    let userObject = {
                        "address": userAddress
                        , "CRSSV11": 0, "CRSS_BUSD": 0, "CRSS_BNB": 0,
                        "BNB_BUSD": 0, "BNB_DOT": 0,
                        "BNB_LINK": 0, "BNB_ETH": 0, "BNB_ADA": 0, "BNB_BTCB": 0, "BUSD_USDC": 0, "BNB_CAKE": 0, "BNB_USDC": 0, "crssOwed": 0
                    }
                    userObject[propertyName] += tokenAmount
                    userObject.crssOwed += crssAmountEquivalent
                    // let userObject = { "address": userAddress, "crssAdjustment": crssAmount }
                    userArray.push(userObject)
                    addrArray.push(userAddress)
                }

            }
        }



    }
    console.log(userArray.length)

    const checkedForExcluded = checkForExcludedAddresses(userArray)
    console.log(checkedForExcluded.length)
    let totalCrssOwed = 0

    for (let i = 0; i < checkedForExcluded.length; i++) {

        totalCrssOwed += checkedForExcluded[i].crssOwed
    }
    checkedForExcluded.sort(sort_by('crssOwed', true, parseInt));
    console.log(included)
    console.log(notIncluded)
    console.log(`Total addresses in staking and farms: ${checkedForExcluded.length}`)
    console.log(`Total value converted to CRSS, block before first attack: ${totalCrssOwed}`)
    console.log(`${uniqueTokenAddresses.length} different staking and farming pools covered`)
    fs.writeFileSync("_snapshot/smartContracts/ReconstructedStakingBlockBeforeAttack.json", JSON.stringify(checkedForExcluded))
}



function orderAndCalculate() {
    filterTokenTransfers()
    getWithdrawLogTransferHashes()
    getDepositLogTransferHashes()
    filterWithdrawsWithHashes()
    filterDepositsWithHashes()
    getUserStakingBeforeAttack()
    // calculateTotalAdjustment()
}
const getAllTransferLogs = async () => {
    await getAllTransferLogsEmergencyWithdraw()
    await getAllTransferLogsWithdraw()
    await getAllTransferLogsDeposit()
}
const gatherLogsAndBEP20Transfers = async () => {



    // await getBEP20Transfers()
    // await getAllTransferLogs()
    orderAndCalculate()





}
gatherLogsAndBEP20Transfers()

