const fs = require("fs");
const beforeValue = require("../Sum_USD_beforeAttack.json");
const afterValue = require("../Sum_USD_afterAttack.json");
const currentValuesCRSS = require("../currentUsersWalletValueInCRSS.json");
//crss-busd pool price 1 block from the exploit (14465247)
//sum_usd_before is not taken from block 14465247, the sumUsd jsons should match the price and timeline used
const currentCrssPrice = 1.2605653314300524;

let crssBefore = []
let crssAfter = []


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


//for this to work sum_usd_before and after jsons need to be on point
function handleUserWalletEnitlement() {

    //this will create an object array of a supplied json file and create a new json in a smart contract compatible format (address:"0x231..",crssOwed(crss or busd): 293.2321)
    function loop(abi, array = []) {
        for (let i = 0; i < abi.length; i++) {
            let res1 = abi[i].assets.total / currentCrssPrice;
            let user = [{ address: abi[i].address, crssOwed: res1 }];
            user.crssOwed = res1;
            array.push(user);
        }
    }
    loop(beforeValue, crssBefore)
    loop(afterValue, crssAfter)

    //sorting by crssOwed value (high to low)
    crssBefore.sort(sort_by('crssOwed', true, parseInt));
    crssAfter.sort(sort_by('crssOwed', true, parseInt));

    //writing the created object arrays to json files
    fs.writeFileSync("crss_crssOwed_before_crss", JSON.stringify(crssBefore))
    fs.writeFileSync("crss_crssOwed_after_crss", JSON.stringify(crssAfter))

    //combined user wallet LP tokens and CRSS crssOweds, before and after
    let res1 = beforeValue.map(bill1 => bill1.assets.total).reduce((acc, bill1) => bill1 + acc);
    let res2 = afterValue.map(bill2 => bill2.assets.total).reduce((acc, bill2) => bill2 + acc);

    console.log(res1)
    console.log(res2)
}
//function handleUserFarmEnitlement() { }
//function handleUserPresaleEnitlement() { }
//function handleUserStakingEnitlement() { }
function getAllAddressesAndCurrentBalanceSorted() {
    let objectArray = currentValuesCRSS
    objectArray.sort(sort_by("crssOwed", true, parseInt))
    fs.appendFileSync("crssOwed_current.json", JSON.stringify(objectArray))
}


function main() {
    getAllAddressesAndCurrentBalanceSorted()
    // handleUserWalletEnitlement()
    //handleUserFarmEnitlement()
    //handleUserPresaleEnitlement()
    //handleUserStakingEnitlement()
}

main()

