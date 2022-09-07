//run with "npx hardhat run scripts/getSmartContractCompensation.js"
//take a look at the main() function at the bottom of the script to choose which data you want to retreive
require("dotenv").config();
const fs = require("fs")
const Web3 = require("web3")
const masterchefAbi = require("../_supporting/abi_masterchef.json");
const masterchef = "0x70873211CB64c1D4EC027Ea63A399A7d07c4085B"

const web3 = new Web3(new Web3.providers.HttpProvider('https://bsc-dataseed2.defibit.io/'))

//very important, used as storage for all addresses in compensation
const userList = require("../_snapshot/fullAddressList.json")
//this is where total CRSS staker list is stored, used for getting global staked CRSS values
const stakingArray = require('../_snapshot/smartContracts/usersCRSSStaked.json')



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

   //this function gets us all current CRSS staking addresses and corresponding staked CRSS amount
   //can be used to determine Masterchef staked CRSS compensation values because historical balances for all 3 relevant timestamps remained the same 
   //this takes a minute or two
   await getMasterchefWeb3Data(masterchefAbi, masterchef)

   //this gives us global data for staked CRSS in Masterchef
   await getMasterchefGlobalData()

}
main()
