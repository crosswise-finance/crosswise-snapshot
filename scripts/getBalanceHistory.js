require("dotenv").config();
const fs = require("fs");
const tokenConstants = require('./constants.js');
const axios = require('axios').default;
let finalListAfter = require("../_snapshot/holders/WalletBalanceAfter.json");
let finalListBefore = require("../_snapshot/holders/WalletBalanceBeforeV2.json")
const fullAddressList = require("../_snapshot/fullAddressList.json")

//this gets us all the token addresses involved
const tokenAddresses = tokenConstants.TokensInScope;
//this give us the names of all involved addresses (addressOfToken1 = tokenAddresses[i] => nameOfToken1 tokenNames[i])
const tokenNames = tokenConstants.TokensInScopeName;
const tokenPrices = tokenConstants.TokensInScopePrice;
const crssPrice = 1.26;
//exact blocks used as time parameters
const timestamp1 = 14465247 //6:07:59 AM UTC, 18.1.2022 (bscscan)


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

//gets us historical balances of all 12 relevant token at target timestamp (block) for each user 
//takes 5h+ to complete, but it's written in a way that the progress of the script can be stopped and resumed with no issues
const getAddressHistoricalBalances = async (addr, timestamp) => {

    let contractBalances = []

    const innerFunction = async (tokenAddress) => {
        let request = await axios.get(`https://api.bscscan.com/api?module=account&action=tokenbalancehistory&contractaddress=${tokenAddress}&address=${addr}&blockno=${timestamp}&apikey=${process.env.BSC_PREMIUM_API}`);
        await delay(0.5)
        let requestData = request.data
        const holderBalance = (requestData.result) / (10 ** 18);
        contractBalances.push(holderBalance)
    }
    for (let i = 0; i < tokenAddresses.length; i++) {
        await innerFunction(tokenAddresses[i])
    }
    let userObject = {
        "address": addr, "CRSSV11": contractBalances[0], "CRSSV1": contractBalances[1], "XCRSS": contractBalances[2], "CRSS_BUSD": contractBalances[3], "CRSS_BNB": contractBalances[4],
        "BNB_BUSD": contractBalances[5], "BNB_DOT": contractBalances[6],
        "BNB_LINK": contractBalances[7], "BNB_ETH": contractBalances[8], "BNB_ADA": contractBalances[9], "BNB_BTCB": contractBalances[10], "BUSD_USDC": contractBalances[11], "BNB_CAKE": contractBalances[12], "BNB_USDC": contractBalances[13],
        "CRSS_USDC": contractBalances[14], "CRSS": contractBalances[15], "crssOwed": 0
    }

    if (timestamp == timestamp1) {
        finalListBefore.push(userObject)
        fs.writeFileSync("_snapshot/holders/WalletBalanceBeforeV2.json", JSON.stringify(finalListBefore))
    } else if (timestamp == timestamp2) {
        finalListAfter.push(userObject)
        fs.writeFileSync("_snapshot/holders/WalletBalanceAfter.json", JSON.stringify(finalListAfter))
    }

    console.log(`done with ${addr}`)

}
//takes list of addresses (totalAddressList.json) and a timestamp as inputs
const getWalletBalances = async (arr = [], timestamp) => {
    if (timestamp == timestamp1) {
        const finalList = finalListBefore;
        for (let i = finalList.length; i < fullAddressList.length; i++) {
            addr = arr[i]
            await getAddressHistoricalBalances(addr, timestamp)
            console.log(`done with ${i}`);
        }

    } else if (timestamp == timestamp2) {
        const finalList = finalListAfter;
        for (let i = finalList.length; i < fullAddressList.length; i++) {//fullAddressList.length
            addr = arr[i]
            await getAddressHistoricalBalances(addr, timestamp)
            console.log(`done with ${i}`);
        }
    }

}
//gets us global data
function getGlobalData(objectArray) {
    const userData = require("../_snapshot/holders/walletBalanceBefore.json")
    let globalObject = {
        "CRSSV11": 0, "CRSSV1": 0, "XCRSS": 0, "CRSS_BUSD": 0, "CRSS_BNB": 0,
        "BNB_BUSD": 0, "BNB_USDT": 0, "BNB_DOT": 0,
        "BNB_LINK": 0, "BNB_ETH": 0, "BNB_ADA": 0, "BNB_BTCB": 0, "totalAddresses": 0, "totalCRSSOwed": 0, "addressesOver10000": 0, "addressesOver1000": 0, "addressesOver100": 0
    }
    for (let i = 0; i < objectArray.length; i++) {
        const addr = objectArray[i]
        globalObject.CRSSV11 += addr.CRSSV11
        globalObject.CRSSV1 += addr.CRSSV1
        globalObject.XCRSS += addr.XCRSS
        globalObject.CRSS_BUSD += addr.CRSS_BUSD
        globalObject.CRSS_BNB += addr.CRSS_BNB
        globalObject.BNB_BUSD += addr.BNB_BUSD
        globalObject.BNB_USDT += addr.BNB_USDT
        globalObject.BNB_DOT += addr.BNB_DOT
        globalObject.BNB_LINK += addr.BNB_LINK
        globalObject.BNB_ETH += addr.BNB_ETH
        globalObject.BNB_ADA += addr.BNB_ADA
        globalObject.BNB_BTCB += addr.BNB_BTCB


    }
    let addressesOver10000 = 0;
    let addressesOver1000 = 0;
    let addressesOver100 = 0;
    let addressesOver0 = 0
    globalObject.totalCRSSOwed = convertAllToCrss(globalObject)
    for (let i = 0; i < userData.length; i++) {
        if (userData[i].crssOwed > 10000) {
            addressesOver10000++
        }
        if (userData[i].crssOwed > 1000) {
            addressesOver1000++
        }
        if (userData[i].crssOwed > 100) {
            addressesOver100++
        }
        if (userData[i].crssOwed > 0) {
            addressesOver0++
        }
    }
    globalObject.addressesOver10000 = addressesOver10000;
    globalObject.addressesOver1000 = addressesOver1000;
    globalObject.addressesOver100 = addressesOver100;
    globalObject.totalAddresses = addressesOver0


    fs.appendFileSync("_snapshot/holders/globalAmountsBefore.json", JSON.stringify(globalObject))
}
function convertAllToCrss(object) {
    let crssOwed = 0
    crssOwed += object.CRSSV11
    crssOwed += object.CRSSV1
    crssOwed += object.XCRSS
    crssOwed += object.CRSS_BUSD / crssPrice * tokenPrices[3]
    crssOwed += object.CRSS_BNB / crssPrice * tokenPrices[4]
    crssOwed += object.BNB_BUSD / crssPrice * tokenPrices[5]
    crssOwed += object.BNB_DOT / crssPrice * tokenPrices[6]
    crssOwed += object.BNB_LINK / crssPrice * tokenPrices[7]
    crssOwed += object.BNB_ETH / crssPrice * tokenPrices[8]
    crssOwed += object.BNB_ADA / crssPrice * tokenPrices[9]
    crssOwed += object.BNB_BTCB / crssPrice * tokenPrices[10]
    crssOwed += object.BNB_CAKE / crssPrice * tokenPrices[11]
    crssOwed += object.BNB_USDC / crssPrice * tokenPrices[13]
    crssOwed += object.CRSS_USDC / crssPrice * tokenPrices[14]
    crssOwed += object.CRSS

    return crssOwed
}
function crssOwed(arr = []) {
    let totalArray = arr;
    for (let i = 0; i < arr.length; i++) {
        const userObject = totalArray[i]
        userObject.crssOwed = convertAllToCrss(userObject);
    }
    let totalCrss = 0

    for (let i = 0; i < totalArray.length; i++) {
        totalCrss += totalArray[i].crssOwed
    }
    if (arr == finalListBefore) {

        fs.writeFileSync("_snapshot/holders/totalAmountsBeforeV2.json", JSON.stringify(totalArray))
        console.log(`Total of ${totalCrss} CRSS added from wallet balances`)
    } else if (arr == finalListAfter) {

        fs.writeFileSync("_snapshot/holders/totalAmountsAfter.json", JSON.stringify(totalArray))
    }

}

function sortAll() {
    finalListAfter.sort
}
//needs full address list to work
const main = async () => {
    // getAddressHistoricalBalances("0x3464010C0Ef748C8AA135195d1Ca1a00AaEc050E", timestamp1)
    // await getWalletBalances(fullAddressList, timestamp1)
    //await getWalletBalances(fullAddressList, timestamp2)
    //getGlobalData(finalListBefore)
}
main()
crssOwed(finalListBefore)