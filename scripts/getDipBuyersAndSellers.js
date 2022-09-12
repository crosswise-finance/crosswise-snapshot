// we manually aquired this data by adjusting Poocoin chart to 1min and zooming in as much as possible in the graphto get buyer and seller date
// for the smallest possible timeframe, and then copy pasted them onto different json files sorted by timeframe of the json in question
// time frames as follow for both sellers and buyers : 1.6:08AM - 7:35AM UTC ,18.jan2022
//                                                     2.7:35AM - 8:05AM UTC ,18.jan2022
//                                                     3.8:05AM - 9:20AM UTC ,18.jan2022
//                                                     4.9:20AM - 5:00AM UTC ,19jan2022
//                                                     only for dip sellers => 5:00AM UTC ,19jan2022 - now
const fs = require("fs")
const B1 = require("../_snapshot/dip/buyers/B0608AM.json")
const B2 = require("../_snapshot/dip/buyers/B0735AM.json")
const B3 = require("../_snapshot/dip/buyers/B0805AM.json")
const B4 = require("../_snapshot/dip/buyers/B0920AM.json")
const S1 = require("../_snapshot/dip/sellers/S0608AM.json")
const S2 = require("../_snapshot/dip/sellers/S0735AM.json")
const S3 = require("../_snapshot/dip/sellers/S0805AM.json")
const S4 = require("../_snapshot/dip/sellers/S0920AM.json")
const S5 = require("../_snapshot/dip/sellers/S0500amM1D19M3D22.json")
const allData = [B1, B2, B3, B4, S1, S2, S3, S4, S5]
//console.log(s5)


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
function combineObjectArrays() {
    let objArr = []
    let uniqueAddresses = []
    for (let i = 0; i < allData.length; i++) {
        const arr = allData[i]
        console.log(`Done with ${[i]}`)
        for (let x = 0; x < arr.length; x++) {
            if (uniqueAddresses.includes(arr[x].address)) {
                //console.log(arr[x].address)
                const index = uniqueAddresses.indexOf(arr[x].address)
                if (arr == B1 || arr == B2 || arr == B3 || arr == B4) {
                    objArr[index].usdValue += arr[x].usdValue
                } else {
                    objArr[index].usdValue -= arr[x].usdValue

                }
                //console.log(`done wirh 2`)
            } else {
                let userUsdValue = 0
                if (arr == B1 || arr == B2 || arr == B3 || arr == B4) {
                    userUsdValue = arr[x].usdValue
                } else {
                    userUsdValue -= arr[x].usdValue

                }
                const userObject = { "address": arr[x].address, "usdValue": userUsdValue }
                objArr.push(userObject)
                uniqueAddresses.push(arr[x].address)
            }
        }

    }
    objArr.sort(sort_by('usdValue', true, parseInt));
    fs.writeFileSync("_snapshot/dip/DipCompensationUsd.json", JSON.stringify(objArr));

}
function convertToCrss() {
    const BUSDPrice = 0.9993
    const priceInCrss = 1.2606
    const arr = require("../_snapshot/dip/DipCompensationUsd.json");
    const convertedArr = []
    for (let i = 0; i < arr.length; i++) {
        const priceInBusd = arr[i].usdValue / BUSDPrice;
        const convertedToCrss = priceInBusd / priceInCrss;
        const userObject = { "address": arr[i].address, "crssOwed": convertedToCrss }
        convertedArr.push(userObject);

    }
    fs.writeFileSync("_snapshot/dip/DipCompensationCrss.json", JSON.stringify(convertedArr));
}
function getGlobalValues() {
    const dipArray = require("../_snapshot/dip/DipCompensationCrss.json")
    let dipSelling = 0
    let dipBuying = 0
    for (let i = 0; i < dipArray.length; i++) {
        const userBalance = dipArray[i].crssOwed
        if (userBalance < 0) {
            dipSelling += userBalance

        } else {
            dipBuying += userBalance

        }
    }
    const total = dipBuying - dipSelling
    const globalObject = { "dipBuyerCompensation": dipBuying, "dipSellingDeduction": dipSelling, "total": total }
    fs.writeFileSync("_snapshot/dip/DipCompensationCrssGlobal.json", JSON.stringify(globalObject));
}

combineObjectArrays()
convertToCrss()
getGlobalValues()