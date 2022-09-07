require("dotenv").config();
const fs = require("fs");
const tokenConstants = require('./constants.js');
const axios = require('axios').default;
let finalListAfter = require("../_snapshot/holders/WalletBalanceAfter.json");
let finalListBefore = require("../_snapshot/holders/WalletBalanceBefore.json")
const fullAddressList = require("../_snapshot/fullAddressList.json")

//this gets us all the token addresses involved
const tokenAddresses = tokenConstants.TokensInScope;
//this give us the names of all involved addresses (addressOfToken1 = tokenAddresses[i] => nameOfToken1 tokenNames[i])
const tokenNames = tokenConstants.TokensInScopeName;
const tokenPrices = tokenConstants.TokensInScopePrice;
const crssPrice = 1.26;
//exact blocks used as time parameters
const timestamp1 = 14465247 //6:07:59 AM UTC, 18.1.2022 (bscscan)
const timestamp2 = 14486353 //11:59:58 PM UTC, 18.1.2022 (bscscan)

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
        "BNB_BUSD": contractBalances[5], "BNB_USDT": contractBalances[6], "BNB_DOT": contractBalances[7],
        "BNB_LINK": contractBalances[8], "BNB_ETH": contractBalances[9], "BNB_ADA": contractBalances[10], "BNB_BTCB": contractBalances[11]
    }

    if (timestamp == timestamp1) {
        finalListBefore.push(userObject)
        fs.writeFileSync("_snapshot/holders/WalletBalanceBefore.json", JSON.stringify(finalListBefore))
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
        for (let i = finalList.length; i < 20; i++) {
            addr = arr[i]
            await getAddressHistoricalBalances(addr, timestamp)
            console.log(`done with ${i}`);
        }
    } else if (timestamp == timestamp2) {
        const finalList = finalListAfter;
        for (let i = finalList.length; i < 20; i++) {//fullAddressList.length
            addr = arr[i]
            await getAddressHistoricalBalances(addr, timestamp)
            console.log(`done with ${i}`);
        }
    }

}
//gets us global data
function getGlobalData(objectArray) {
    let globalObject = {
        "CRSSV11": 0, "CRSSV1": 0, "XCRSS": 0, "CRSS_BUSD": 0, "CRSS_BNB": 0,
        "BNB_BUSD": 0, "BNB_USDT": 0, "BNB_DOT": 0,
        "BNB_LINK": 0, "BNB_ETH": 0, "BNB_ADA": 0, "BNB_BTCB": 0, "totalAddresses": objectArray.length, "totalCRSSOwed": 0
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
    globalObject.totalCRSSOwed += globalObject.CRSSV11
    globalObject.totalCRSSOwed += globalObject.CRSSV1
    globalObject.totalCRSSOwed += globalObject.XCRSS
    globalObject.totalCRSSOwed += globalObject.CRSS_BUSD / crssPrice * tokenPrices[3]
    globalObject.totalCRSSOwed += globalObject.CRSS_BNB / crssPrice * tokenPrices[4]
    globalObject.totalCRSSOwed += globalObject.BNB_BUSD / crssPrice * tokenPrices[5]
    globalObject.totalCRSSOwed += globalObject.BNB_USDT / crssPrice * tokenPrices[6]
    globalObject.totalCRSSOwed += globalObject.BNB_DOT / crssPrice * tokenPrices[7]
    globalObject.totalCRSSOwed += globalObject.BNB_LINK / crssPrice * tokenPrices[8]
    globalObject.totalCRSSOwed += globalObject.BNB_ETH / crssPrice * tokenPrices[9]
    globalObject.totalCRSSOwed += globalObject.BNB_ADA / crssPrice * tokenPrices[10]
    globalObject.totalCRSSOwed += globalObject.BNB_BTCB / crssPrice * tokenPrices[11]
    fs.appendFileSync("_snapshot/holders/globalAmountsBefore.json", JSON.stringify(globalObject))
}

function sortAll() {
    finalListAfter.sort
}
//needs full address list to work
const main = async () => {
    await getWalletBalances(fullAddressList, timestamp1)
    //await getWalletBalances(fullAddressList, timestamp2)
    //getGlobalData(finalList)
}
main()