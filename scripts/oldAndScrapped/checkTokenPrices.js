require("dotenv").config();
const fs = require("fs");
const tokenConstants = require('../constants.js');
const axios = require('axios').default;
let finalListAfter = require("../../_snapshot/holders/WalletBalanceAfter.json");
let finalListBefore = require("../../_snapshot/holders/WalletBalanceBefore.json")
const fullAddressList = require("../../_snapshot/fullAddressList.json");
const { mainModule } = require("process");
const crssTokenAddress = "0x99FEFBC5cA74cc740395D65D384EDD52Cb3088Bb".toLowerCase();
const wbnb = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c"
const busd = "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56"
const ada = "0x3EE2200Efb3400fAbB9AacF31297cBdD1d435D47"
const crssBnbPair = "0xb5d85cA38a9CbE63156a02650884D92A6e736DDC"
const crssBusdPair = "0xB9B09264779733B8657b9B86970E3DB74561c237"
const crssAdaPair = "0x2c52ea643b861e8c1f9ebff52bc46cbfc102a6ff"
//this gets us all the token addresses involved
const tokenAddresses = tokenConstants.LPAddresses;
//this give us the names of all involved addresses (addressOfToken1 = tokenAddresses[i] => nameOfToken1 tokenNames[i])
const tokenNames = tokenConstants.LPNames;
const tokenPrices = tokenConstants.LPPrices;
const crssPrice = 1.26;
//exact blocks used as time parameters
const timestamp1 = 14465247 //6:07:59 AM UTC, 18.1.2022 (bscscan)
const timestamp2 = 14486353 //11:59:58 PM UTC, 18.1.2022 (bscscan)
let objectArray = []
//we need this to create space between Api Pro requests to avoid missing data, since the relevant ones are capped to 2 calls per second
function delay(n) {
    return new Promise(function (resolve) {
        setTimeout(resolve, n * 1000);
    });
}
const main = async () => {

    await getHistoricalBalanceFor(crssBnbPair, wbnb, crssTokenAddress)
    await getHistoricalBalanceFor(crssBusdPair, busd, crssTokenAddress)
    await getHistoricalBalanceFor(crssAdaPair, ada, crssTokenAddress)
    fs.writeFileSync("_snapshot/poolPrices.json", JSON.stringify(objectArray))
}
const getHistoricalBalanceFor = async (pairAddress, holdingTokenAddress1, holdingTokenAddress2) => {

    const inner = async () => {
        let request1 = await axios.get(`https://api.bscscan.com/api?module=account&action=tokenbalancehistory&contractaddress=${holdingTokenAddress1}&address=${pairAddress}&blockno=${timestamp1}&apikey=${process.env.BSC_PREMIUM_API}`);
        await delay(0.5)
        let request2 = await axios.get(`https://api.bscscan.com/api?module=account&action=tokenbalancehistory&contractaddress=${holdingTokenAddress2}&address=${pairAddress}&blockno=${timestamp1}&apikey=${process.env.BSC_PREMIUM_API}`);
        await delay(0.5)
        const response1 = request1.data.result
        const balance1 = response1 / 10 ** 18
        const response2 = request2.data.result
        const balance2 = response2 / 10 ** 18

        const holderBalance = balance1 / balance2;
        const poolIndex = tokenAddresses.indexOf(pairAddress)
        const poolName = tokenNames[poolIndex]
        const poolObject = { "address": poolName, "crssPrice": holderBalance, "crss": balance2, "bep20": balance1 }
        objectArray.push(poolObject)
        // contractBalances.push(holderBalance)
        //return 
    }
    await inner()
}
main()
/*const getAllPairTokenPrices = async () => {
    for (let i = 0; i < tokenAddresses.length; i++) {
        const addressOfPair = tokenAddresses[i]
        await getHistoricalBalanceFor(addressOfPair)
    }

}
const getHistoricalBalanceFor = async (pairAddress) => {
    for (let i = 0; i < tokenAddresses.length; i++) {
        const poolAddress
    }
    const inner = async (holdingTokenAddress, timestamp) => {
        let request = await axios.get(`https://api.bscscan.com/api?module=account&action=tokenbalancehistory&contractaddress=${holdingTokenAddress}&address=${pairAddress}&blockno=${timestamp}&apikey=${process.env.BSC_PREMIUM_API}`);
        await delay(0.5)
        let requestData = request.data
        const holderBalance = (requestData.result) / (10 ** 18);
        contractBalances.push(holderBalance)
    }
}*/
