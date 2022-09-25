require("dotenv").config();
const fs = require("fs");
const axios = require('axios').default;

const Web3 = require("web3")

const tokenConstants = require('./constants.js');
const lpAddresses = tokenConstants.LPAddresses
const lpNames = tokenConstants.LPNames

const web3 = new Web3(new Web3.providers.HttpProvider('https://bsc-dataseed2.defibit.io/'))
//const contract = new web3.eth.Contract(masterchefAbi, masterchef);
//topic used to filter relevant events
//this give us the names of all involved addresses (addressOfToken1 = tokenAddresses[i] => nameOfToken1 tokenNames[i])
const tokenNames = tokenConstants.TokensInScopeName;

const crssPrice = 1.26;



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

let s_array = []
const addressArr = [
    "0xb5d85cA38a9CbE63156a02650884D92A6e736DDC".toLowerCase(), // Crss-bnb
    "0xB9B09264779733B8657b9B86970E3DB74561c237".toLowerCase(), // Crss-busd
    "0x21d398F619a7A97e0CAb6443fd76Ef702B6dCE8D".toLowerCase(), // Crss-usdt
    "0x8151D70B5806E3C957d9deB8bbB01352482a4741".toLowerCase(), // Bnb-Eth
    "0xDE0356A496a8d492431b808c758ed5075Dd85040".toLowerCase(), // Bnb-Ada
    "0x290E1ad05b4D906B1E65B41e689FC842C9962825".toLowerCase(), // Bnb-Busd
    "0x278D7d1834E008864cfB247704cF34a171F39a2C".toLowerCase(), // Bnb-Link
    "0x9Ba0DcE71930E6593aB34A1EBc71C5CebEffDeAF".toLowerCase(), // Bnb-Btcb
    "0xef5be81A2B5441ff817Dc3C15FEF0950DD88b9bD".toLowerCase(), // Busd-usdt
    "0x0458498C2cCbBe4731048751896A052e2a5CC041".toLowerCase(), // Bnb-Cake
    "0xCB7Ad3af3aE8d6A04ac8ECA9a77a95B2a72B06DE".toLowerCase(), // Bnb-Dot
    "0x9cbed1220E01F457772cEe3AAd8B94A142fc975F".toLowerCase(), // Pancake Crss-BNB LP
    "0x73C02124d38538146aE2D807a3F119A0fAd3209c".toLowerCase(),// Biswap Crss-BNB LP


]
//this gets us all the token addresses involved
const tokenAddresses = [
    "0x99FEFBC5cA74cc740395D65D384EDD52Cb3088Bb".toLowerCase(),//CRSS11
    "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56".toLowerCase(),//BUSD
    "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c".toLowerCase(),//WBNB

    "0x55d398326f99059fF775485246999027B3197955".toLowerCase(),//BUSDC
    "0x2170Ed0880ac9A755fd29B2688956BD959F933F8".toLowerCase(),//ETH
    "0x3EE2200Efb3400fAbB9AacF31297cBdD1d435D47".toLowerCase(),//ADA
    "0xF8A0BF9cF54Bb92F17374d9e9A321E6a111a51bD".toLowerCase(),//LINK
    "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c".toLowerCase(),//BTCB
    "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82".toLowerCase(),//CAKE
    "0x7083609fCE4d1d8Dc0C979AAb8c869Ea2C873402".toLowerCase(),//DOT




]
//BBE price used for CRSS taken from CRSS/BUSD pool, rest taken from CMC at 18.1.2022, 5AM
//5 decimals was used whenever possible
const tokenPrices = [1.26, //crss
    1.0008,//busd
    471.18,//bnb
    0.9998,//usdc
    3182.8,//eth
    1.5752,//ada
    23.57, //link
    42085,//btc
    11.2,//cake
    25.39,//dot
]

//we need this to create space between Api Pro requests to avoid missing data, since the relevant ones are capped to 2 calls per second
function delay(n) {
    return new Promise(function (resolve) {
        setTimeout(resolve, n * 1000);
    });
}
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
        "address": addr, "CRSSV11": contractBalances[0], "BUSD": contractBalances[1], "WBNB": contractBalances[2],
        "USDC": contractBalances[3], "ETH": contractBalances[4], "ADA": contractBalances[5],
        "LINK": contractBalances[6], "BTC": contractBalances[7], "CAKE": contractBalances[8], "DOT": contractBalances[9], "BNBBalance": 0, "poolValueInUsd": 0
    }

    let request = await axios.get(`https://api.bscscan.com/api?module=account&action=balancehistory&address=${addr}&blockno=${timestamp}&apikey=${process.env.BSC_PREMIUM_API} `);
    await delay(0.5)
    let requestData = request.data
    const nativeBalance = (requestData.result) / (10 ** 18);
    userObject.BNBBalance = nativeBalance
    let totalBalanceInUsd = 0
    for (let i = 0; i < contractBalances.length; i++) {
        const tokenAmount = contractBalances[i]
        const tokenPriceUsd = tokenPrices[i]
        const tokenValue = tokenPriceUsd * tokenAmount
        totalBalanceInUsd += tokenValue

    }
    totalBalanceInUsd += userObject.BNBBalance * tokenPrices[2]
    userObject.poolValueInUsd = totalBalanceInUsd

    s_array.push(userObject)
    fs.writeFileSync("_snapshot/misc/LiquidityPoolValuesBefore.json", JSON.stringify(s_array))

    console.log(`done with ${addr} for ${totalBalanceInUsd} total pool value in usd`)

}
//takes list of addresses (totalAddressList.json) and a timestamp as inputs
const getWalletBalances = async (timestamp) => {


    for (let i = 0; i < lpAddresses.length; i++) {
        const addr = lpAddresses[i]
        await getAddressHistoricalBalances(addr, timestamp)
        console.log(`done with ${i}`);
    }

}

const getSupplyByBlock = async (timestamp) => {
    let userArray = []
    const inner = async (_address) => {
        let request = await axios.get(`https://api.bscscan.com/api?module=stats&action=tokensupplyhistory&contractaddress=${_address}&blockno=${timestamp}&apikey=${process.env.BSC_PREMIUM_API}`)
        const responseData = request.data
        const responseValue = responseData.result / 10 ** 18
        const nameIndex = lpAddresses.indexOf(_address)
        const name = lpNames[nameIndex]
        const object = { "identifier": name, "timestamp": timestamp, "LPTokenSupply": responseValue }
        userArray.push(object)
    }
    for (let i = 0; i < lpAddresses.length; i++) {
        const addr = lpAddresses[i]
        await inner(addr)
        await delay(0.5);
    }
    fs.writeFileSync("_snapshot/misc/historicLPTokenSupplyBefore.json", JSON.stringify(userArray))
}
function calculatePrices() {
    const supplyJson = require("../_snapshot/misc/historicLPTokenSupplyBefore.json")
    const balancesJson = require("../_snapshot/misc/LiquidityPoolValuesBefore.json")
    let userArr = []
    for (let i = 0; i < balancesJson.length; i++) {
        const usdValue = balancesJson[i].poolValueInUsd
        const supplyAmount = supplyJson[i].LPTokenSupply
        const lpTokenPrice = usdValue / supplyAmount
        const lpTokenPriceBusd = lpTokenPrice / tokenPrices[1]
        const userObject = { "name": supplyJson[i].identifier, "LPPrice": lpTokenPrice, "LPPriceBusd": lpTokenPriceBusd }
        userArr.push(userObject)
    }
    fs.writeFileSync("_snapshot/misc/historicLPTokenPricesBefore.json", JSON.stringify(userArr))

}


const main = async () => {
    const latest = await web3.eth.getBlockNumber()

    await getWalletBalances(timestamp1)
    await getSupplyByBlock(timestamp1)
    //for testing accuracy of supply and address balances
    //getWalletBalances(latest - 1000)
    // await getSupplyByBlock(latest - 1000)
}
//main()
calculatePrices()