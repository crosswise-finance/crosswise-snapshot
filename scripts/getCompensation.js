const fs = require("fs");
const finalListBefore = require("../_snapshot/holders/walletBalanceBefore.json")
let fullAddressList = require("../_snapshot/fullAddressList.json")
const stakingArray = require('../_snapshot/smartContracts/totalAdjustedStaking.json')
const presaleList1 = require("../_snapshot/presale/presaleCRSSEnitlement1.json")
const presaleList2 = require("../_snapshot/presale/presaleCRSSEnitlement2.json")
const dipList = require("../_snapshot/dip/DipCompensationCrss.json")
const tokenConstants = require('./constants.js');
const excludedAddresses = tokenConstants.excludedAddr
const manualAdjustmentsFile = require("./manualAdjustments.js")

let numOfIncluded = 0
let objectArray = []
let checkedArray = []
let newAdded = 0
let newValueAdded = 0


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

      if (addedValue > 0 && oldValue == 0) {
        numOfIncluded++
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

      objectArray.push()
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
    const userAddress = arr[i].address
    for (let x = 0; x < replaceAddresses.length; x++) {
      if ((replaceAddresses[x].oldAddress).toLowerCase() == userAddress) {
        arr[i].address = (replaceAddresses[x].newAddress).toLowerCase()
        arr[i].crssOwed /= 2
        toMarketing += arr[i].crssOwed
      }
    }
  }
  arr.push({ "address": "0x10E5Bd7DdE3894a1f99bc24ADeE4674772f3a3EA".toLowerCase(), "crssOwed": toMarketing, "presale": 0, "wallet": 0, "staking": 0, "dipBuys": 0 })
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
  let totalCrssToRefund = 0
  for (let i = 0; i < checkedArray.length; i++) {
    totalCrssToRefund += checkedArray[i].crssOwed
  }
  console.log(`Included ${newAdded} new addresses from dip buyers for ${newValueAdded} CRSS`)
  console.log(`Total crss to refund: ${totalCrssToRefund}`)
  const adjustedArr = manualAdjustments(checkedArray)
  adjustedArr.sort(sort_by('crssOwed', true, parseInt));
  adjustedArr[0].address = "0xb96235f423Fb407b5f9c3A227de86B2A5057A656".toLowerCase()
  console.log(`Number of addresses in compensation: ${checkedArray.length}`)

  fs.writeFileSync("_snapshot/compensationV1.json", JSON.stringify(adjustedArr))
}
getCompensation()
