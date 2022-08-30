//run with "npx hardhat run scripts/getSmartContractCompensation.js"
//take a look at the main() function at the bottom of the script to choose which data you want to retreive
require("dotenv").config();
const fs = require("fs")
const tokenConstants = require('./constants.js')
const axios = require('axios').default;
const Web3 = require("web3")
const masterchefAbi = require("../_supporting/abi_masterchef.json");
const masterchef = "0x70873211CB64c1D4EC027Ea63A399A7d07c4085B"

const web3 = new Web3(new Web3.providers.HttpProvider('https://bsc-dataseed2.defibit.io/'))

//very important, used as storage for all addresses in compensation
const userList = require("../_snapshot/fullAddressList.json")
//this is where total CRSS staker list is stored, used for getting global staked CRSS values
const stakingArray = require('../_snapshot/smartContracts/usersCRSSStaked.json')

//this gets us all the token addresses involved
const tokenAddresses = tokenConstants.TokensInScope;
//this give us the names and corresponding prices of all involved addresses (addressOfToken1 = tokenAddresses[i] => nameOfToken1 tokenNames[i])
//useful for creating 14(reduced to 12) separate lists of holders by contract address if needed
//price is used to automatically convert tokens to CRSS to get total compensation value of users in CRSS
const tokenNames = tokenConstants.TokensInScopeName;
const tokenPrices = tokenConstants.TokensInScopePrice;
const crssPrice = 1.26;
//exact blocks used as time parameters
const timestamp1 = 14465247 //6:07:59 AM UTC, 18.1.2022 (bscscan)
const timestamp2 = 14486353 //11:59:58 PM UTC, 18.1.2022 (bscscan)
const timestamp3 = 20753848 //current (7:16PM 25.8.2022) **this should be updated on the final day of compensation


let contractBalances = []


//we need this to create space between Api Pro requests, since the relevant ones are capped to 2 calls per second
function delay(n) {
   return new Promise(function (resolve) {
      setTimeout(resolve, n * 1000);
   });
}

//this is a helper function for sorting addresses 
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

const getSmartContractHistoricalBalance = async (contractAddress, timestamp) => {

   //api approach
   const innerFunction = async (tokenAddress) => {
      let request = await axios.get(`https://api.bscscan.com/api?module=account&action=tokenbalancehistory&contractaddress=${tokenAddress}&address=${contractAddress}&blockno=${timestamp}&apikey=${process.env.BSC_PREMIUM_API}`)
      let data = request.data;
      let balance = (data.result) / (10 ** 18);
      contractBalances.push(balance)

      await delay(1)
   }
   for (let i = 0; i < tokenAddresses.length; i++) {
      await innerFunction(tokenAddresses[i])
   }
   let object = {
      "CRSSV11": contractBalances[0], "CRSSV1": contractBalances[1], "XCRSS": contractBalances[2], "CRSS_BUSD": contractBalances[3], "CRSS_BNB": contractBalances[4],
      "CRSS_USDT": contractBalances[5], "CRSS_CAKE": contractBalances[6], "BNB_BUSD": contractBalances[7], "BNB_USDT": contractBalances[8], "BNB_DOT": contractBalances[9],
      "BNB_LINK": contractBalances[10], "BNB_ETH": contractBalances[11], "BNB_ADA": contractBalances[12], "BNB_BTCB": contractBalances[13]
   }
   if (timestamp == timestamp1) {
      fs.appendFileSync("_snapshot/smartContracts/masterchefFirstTimestamp.json", JSON.stringify(object))
   }
   if (timestamp == timestamp2) {
      fs.appendFileSync("_snapshot/smartContracts/masterchefSecondTimestamp.json", JSON.stringify(object))
   }
   if (timestamp == timestamp3) {
      fs.appendFileSync("_snapshot/smartContracts/masterchefCurrentTimestamp.json", JSON.stringify(object))
   }

}

//this will get us user info for CRSS pool in Masterchef
const getMasterchefWeb3Data = async () => {
   const contract = new web3.eth.Contract(masterchefAbi, masterchef);
   let objectArray = []


   const innerFunction = async (address) => {

      let userObject = { "address": address, "crssOwed": 0 }
      const userInfo = await contract.methods.userInfo(0, address).call()
      const userStakedBalance = (userInfo.amount) / (10 ** 18)
      userObject.crssOwed = userStakedBalance

      //userObject.crssOwed = userStakedBalance
      if (userObject.crssOwed > 0) {
         objectArray.push(userObject)

      }
      console.log(`done with  ${address} for ${userObject.crssOwed} CRSS`)
   }
   //userList.length
   for (let i = 0; i < userList.length; i++) {
      const userAddress = userList[i]
      await innerFunction(userAddress)
      console.log(`Done with ${i}`)


   }
   await delay(1)
   objectArray.sort(sort_by('crssOwed', true, parseInt));
   fs.appendFileSync('_snapshot/smartContracts/usersCRSSStaked.json', JSON.stringify(objectArray))
}
const getMasterchefGlobalData = async () => {

   let globalObject = { "totalCRSSStaked": 0, "totalAddressesInStaking": stakingArray.length }

   for (let i = 0; i < stakingArray.length; i++) {
      globalObject.totalCRSSStaked += stakingArray[i].crssOwed;

   }
   fs.appendFileSync("_snapshot/smartContracts/masterchefStakingGlobal.json", JSON.stringify(globalObject))
}

const main = async () => {

   //gets us total historical values for all 12 relevant tokens inside Masterchef for 3 timestamps
   //await getSmartContractHistoricalBalance(masterchef, timestamp1)
   //await getSmartContractHistoricalBalance(masterchef, timestamp2)
   //await getSmartContractHistoricalBalance(masterchef, timestamp3)

   //this function gets us all current CRSS staking addresses and corresponding staked CRSS amount
   //can be used to determine Masterchef staked CRSS compensation values because historical balances for all 3 relevant timestamps remained the same 
   //this takes a minute or two
   //await getMasterchefWeb3Data(masterchefAbi, masterchef)

   //this gives us global data for staked CRSS in Masterchef
   await getMasterchefGlobalData()

}
main()
