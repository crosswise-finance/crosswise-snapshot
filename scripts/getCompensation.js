const fs = require("fs");
require("dotenv").config();
const axios = require('axios').default;
const finalListBefore = require("../_snapshot/holders/WalletBalanceBeforeV2.json")
let fullAddressList = require("../_snapshot/fullAddressList.json")
//if you are using old approach that only looks at CRSS staking
//const stakingArray = require('../_snapshot/smartContracts/totalAdjustedStaking.json')
//for new approach that reconstruct pre-attack staking and farming amounts
const stakingArray = require("../_snapshot/smartContracts/ReconstructedStakingBlockBeforeAttack.json")
const presaleList1 = require("../_snapshot/presale/presaleCRSSEnitlement1.json")
const presaleList2 = require("../_snapshot/presale/presaleCRSSEnitlement2.json")
const dipList = require("../_snapshot/dip/DipCompensationCrss.json")
const tokenConstants = require('./constants.js');
const excludedAddresses = tokenConstants.excludedAddr
const manualAdjustmentsFile = require("./manualAdjustments.js")
const CRSSV11 = "0x99FEFBC5cA74cc740395D65D384EDD52Cb3088Bb"


let objectArray = []
let checkedArray = []
let newAdded = 0
let newValueAdded = 0
let totalCrssToRefund = 0

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

function calculateAll(arr = []) {

  for (let i = 0; i < arr.length; i++) {
    const userAddress = (arr[i].address).toLowerCase()
    const addedValue = arr[i].crssOwed
    if (fullAddressList.includes(userAddress)) {
      newValueAdded += addedValue

      const index = fullAddressList.indexOf(userAddress)

      const oldValue = objectArray[index].crssOwed


      if (arr == presaleList1 || arr == presaleList2) {
        objectArray[index].presale += addedValue
        objectArray[index].crssOwed += addedValue
      } else if (arr == stakingArray) {
        objectArray[index].staking += addedValue
        objectArray[index].crssOwed += addedValue
      } else if (arr == finalListBefore) {
        objectArray[index].wallet += addedValue
        objectArray[index].crssOwed += addedValue
      } else if (arr == dipList) {
        //we apply 30% shave on dip buy compensation
        if (arr[i].crssOwed > 0) {
          objectArray[index].dipBuys += (addedValue * 0.7)
          objectArray[index].crssOwed += (addedValue * 0.7)
        } else {
          objectArray[index].dipBuys += addedValue
          objectArray[index].crssOwed += addedValue
        }
      }


    }
    else {
      fullAddressList.push(userAddress)
      let userObject = { "address": userAddress, "crssOwed": 0, "presale": 0, "wallet": 0, "staking": 0, "dipBuys": 0 }
      if (arr == presaleList1 || arr == presaleList2) {
        userObject.presale += addedValue
        userObject.crssOwed += addedValue
      } else if (arr == stakingArray) {
        userObject.staking += addedValue
        userObject.crssOwed += addedValue
      } else if (arr == finalListBefore) {
        userObject.wallet += addedValue
        userObject.crssOwed += addedValue
      } else if (arr == dipList) {
        //we apply 30% shave on dip buy compensation
        if (arr[i].crssOwed > 0) {
          userObject.dipBuys += (addedValue * 0.7)
          userObject.crssOwed += (addedValue * 0.7)
        } else {
          userObject.dipBuys += addedValue
          userObject.crssOwed += addedValue
        }
      }

      newAdded++
      newValueAdded += addedValue
      objectArray.push(userObject)

    }

  }
}

function createObjectArray() {

  for (let i = 0; i < fullAddressList.length; i++) {
    let userObject = { "address": fullAddressList[i], "crssOwed": 0, "presale": 0, "wallet": 0, "staking": 0, "dipBuys": 0 }
    objectArray.push(userObject)
  }
}

function checkForExcludedAddresses() {
  for (let i = 0; i < objectArray.length; i++) {
    let excluded = false;
    const userAddress = (objectArray[i].address).toLowerCase()
    for (let x = 0; x < excludedAddresses.length; x++) {
      if (userAddress == excludedAddresses[x]) {
        excluded = true
        console.log("Found excluded address")
      }
    }
    if (excluded == false) {
      checkedArray.push(objectArray[i])
    }

  }
}

function manualAdjustments(arr = []) {

  const replaceAddresses = manualAdjustmentsFile.addressesToChange
  const conversionAddresses = manualAdjustmentsFile.failedConversionAdjustments
  const specialCaseAddress = manualAdjustmentsFile.specialCaseAddress
  let addressArr = []
  let toMarketing = 0
  for (let i = 0; i < arr.length; i++) {
    addressArr.push(arr[i].address)
  }
  //replace addresses
  for (let i = 0; i < arr.length; i++) {
    const userAddress = arr[i].address.toLowerCase()
    for (let x = 0; x < replaceAddresses.length; x++) {
      if ((replaceAddresses[x].oldAddress).toLowerCase() == userAddress) {
        arr[i].address = (replaceAddresses[x].newAddress).toLowerCase()
        arr[i].crssOwed /= 2
        toMarketing += arr[i].crssOwed
      }
    }
  }
  arr.push({ "address": "0x10E5Bd7DdE3894a1f99bc24ADeE4674772f3a3EA".toLowerCase(), "crssOwed": toMarketing, "presale": 0, "wallet": 0, "staking": 0, "dipBuys": 0 })
  //this is for a user that reported a buy missing with transaction hash as proof
  const userAddress1 = "0xD4105c56dCd0497B3b220Eb2Fc88022465717a2f".toLowerCase()
  const userIndex1 = addressArr.indexOf(userAddress1)
  checkedArray[userIndex1].crssOwed += 59.22
  checkedArray[userIndex1].dipBuys += 59.22

  for (let i = 0; i < arr.length; i++) {
    if (arr[i].address == (specialCaseAddress.oldAddress).toLowerCase()) {

      arr.push({ "address": (specialCaseAddress.newAddress).toLowerCase(), "crssOwed": arr[i].crssOwed, "presale": arr[i].presale, "wallet": arr[i].wallet, "staking": arr[i].staking, "dipBuys": arr[i].dipBuys })
      arr[i].crssOwed = 0
      arr[i].presale = 0
      arr[i].staking = 0
      arr[i].wallet = 0
      arr[i].dipBuys = 0
    }
  }

  let arrOneFound = false
  let arrTwoFound = false
  for (let i = 0; i < arr.length; i++) {
    if (arr[i].address == conversionAddresses[0].oldAddress) {
      arr[i].crssOwed += conversionAddresses[0].crssOwed
      arr[i].wallet += conversionAddresses[0].crssOwed
      arrOneFound = true
    }

    if (arr[i].address == conversionAddresses[1].oldAddress) {
      arr[i].crssOwed += conversionAddresses[1].crssOwed
      arr[i].wallet += conversionAddresses[1].crssOwed
      arrTwoFound = true
    }
  }
  if (arrOneFound == false) {
    arr.push({ "address": (conversionAddresses[0].oldAddress).toLowerCase(), "crssOwed": conversionAddresses[0].crssOwed, "presale": 0, "wallet": conversionAddresses[0].crssOwed, "staking": 0, "dipBuys": 0 })
  }
  if (arrTwoFound == false) {
    arr.push({ "address": (conversionAddresses[1].oldAddress).toLowerCase(), "crssOwed": conversionAddresses[1].crssOwed, "presale": 0, "wallet": conversionAddresses[1].crssOwed, "staking": 0, "dipBuys": 0 })
  }
  return arr
}
function getCompensation() {
  createObjectArray()
  calculateAll(finalListBefore)
  calculateAll(stakingArray)
  calculateAll(presaleList1)
  calculateAll(presaleList2)
  calculateAll(dipList)
  checkForExcludedAddresses()



  for (let i = 0; i < checkedArray.length; i++) {
    totalCrssToRefund += checkedArray[i].crssOwed
  }
  let averageComp = totalCrssToRefund / checkedArray.length
  let over10000 = 0
  let over1000 = 0
  let over100 = 0



  console.log(`Total crss to refund: ${totalCrssToRefund}`)
  let adjustedArr = manualAdjustments(checkedArray)
  adjustedArr.sort(sort_by('crssOwed', true, parseInt));
  adjustedArr[0].address = "0xb96235f423Fb407b5f9c3A227de86B2A5057A656".toLowerCase()
  for (let i = 0; i < adjustedArr.length; i++) {
    if (adjustedArr[i].crssOwed >= 10000) {
      over10000++
    }
    if (adjustedArr[i].crssOwed >= 1000) {
      over1000++
    }
    if (adjustedArr[i].crssOwed >= 100) {
      over100++
    }

  }
  console.log(`Number of addresses in compensation: ${adjustedArr.length}`)
  console.log(`Average compensation : ${averageComp}, there are ${over10000} addresses with more than 10k CRSS, ${over1000} with more than 1k and ${over100} addresses with 100 or more CRSS`)
  addLiquidityTokensFromOldPairs(adjustedArr)

}
const pairAddresses = [
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
  "0x99fefbc5ca74cc740395d65d384edd52cb3088bb".toLowerCase()


]
//this part of the script is for adding LP wallet balances to compensation, so we can have enough starting liquidity
const timestamp1 = 14465247 //6:07:59 AM UTC, 18.1.2022 (bscscan)

//we need this to create space between Api Pro requests to avoid missing data, since the relevant ones are capped to 2 calls per second
function delay(n) {
  return new Promise(function (resolve) {
    setTimeout(resolve, n * 1000);
  });
}
const addLiquidityTokensFromOldPairs = async (arr = []) => {
  await getWalletBalances(arr, timestamp1)
  fs.writeFileSync("_snapshot/compensationV1a.json", JSON.stringify(arr))
}
const getAddressHistoricalBalances = async (addr, timestamp) => {
  let request = await axios.get(`https://api.bscscan.com/api?module=account&action=tokenbalancehistory&contractaddress=${CRSSV11}&address=${addr}&blockno=${timestamp}&apikey=${process.env.BSC_PREMIUM_API}`);
  await delay(0.5)
  let requestData = request.data
  const holderBalance = (requestData.result) / (10 ** 18);


  console.log(`done with ${addr}`)
  return holderBalance

}
//takes list of addresses (totalAddressList.json) and a timestamp as inputs
const getWalletBalances = async (arr = [], timestamp) => {

  const currentCrss = arr[0].crssOwed
  for (let i = 0; i < pairAddresses.length; i++) {
    addr = pairAddresses[i]
    const crssForLiquidity = await getAddressHistoricalBalances(addr, timestamp)
    arr[0].crssOwed += crssForLiquidity
    console.log(`done with ${i}`);
  }
  const newCrss = arr[0].crssOwed
  const addedValue = newCrss - currentCrss
  arr[0].reserveForLiquidity = addedValue
  console.log(`Added ${addedValue} CRSS to dev wallet from previous LP pairs, for liquidity`)
  console.log(`Total compensation with reserved liquidity: ${totalCrssToRefund + addedValue}`)
}
getCompensation()
