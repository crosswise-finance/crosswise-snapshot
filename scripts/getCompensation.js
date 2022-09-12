const fs = require("fs");
const finalListBefore = require("../_snapshot/holders/totalAmountsBefore.json")
let fullAddressList = require("../_snapshot/fullAddressList.json")
const stakingArray = require('../_snapshot/smartContracts/depositAdjustedStaking.json')
const presaleList1 = require("../_snapshot/presale/presaleCRSSEnitlement1.json")
const presaleList2 = require("../_snapshot/presale/presaleCRSSEnitlement2.json")
const dipList = require("../_snapshot/dip/DipCompensationCrss.json")

let numOfIncluded = 0
let objectArray = []
let totalCrssValue = 0
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
          // userObject.dipBuys += (addedValue * 0.7)
          // userObject.crssOwed += (addedValue * 0.7)
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
function getCompensation() {
  createObjectArray()
  calculateAll(finalListBefore)
  calculateAll(stakingArray)
  calculateAll(presaleList1)
  calculateAll(presaleList2)
  calculateAll(dipList)
  let totalCrssToRefund = 0
  for (let i = 0; i < objectArray.length; i++) {
    totalCrssToRefund += objectArray[i].crssOwed
  }
  console.log(`Included ${numOfIncluded} different compensations for total ${fullAddressList.length} number of addresses we checked and ${totalCrssValue} CRSS in value`)
  console.log(`Included ${newAdded} new addresses from dip buyers for ${newValueAdded} CRSS`)
  console.log(`Total crss to refund: ${totalCrssToRefund}`)
  console.log(fullAddressList.length)
  objectArray.sort(sort_by('crssOwed', true, parseInt));
  fs.writeFileSync("_snapshot/compensationV1.json", JSON.stringify(objectArray))
}
getCompensation()
