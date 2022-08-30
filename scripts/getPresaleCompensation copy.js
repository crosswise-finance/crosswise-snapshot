//for this to work you need presale ABIs stored somewhere, I will add them to Github alongside this script, the presale smart contract addresses should already be in constants.js
//in addition to installing WEB3 and FS ("npm i web3", or "yarn add fs") you might also need to create the _snapshot/presale folder for storing the output data
//run the scripts with "npx hardhat run scripts/getPresaleCompensation.js" or "yarn hardhat -||-"

//importing needed tools
const fs = require("fs")
const Web3 = require('web3')
const Contract = require('web3-eth-contract')

//fetching presale contract addresses and their respective ABIs
const { presale1, presale2 } = require("./constants")
const presale1ABI = require("../_supporting/abi_presale1.json")
const presale2ABI = require("../_supporting/abi_presale2.json")

//initialize web3
const web3 = new Web3(new Web3.providers.HttpProvider('https://bsc-dataseed2.defibit.io/'));

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

const getPresaleInfo = async (address, abi, round) => {
    //instantiate presale smart contract
    Contract.setProvider('https://bsc-dataseed2.defibit.io/');
    const contract = new web3.eth.Contract(abi, address);

    //create investor array to store return info from allInvestors() view function (returns all addresses involved in the presale)
    let investors = []
    investors = await contract.methods.allInvestors().call()

    //get total amounts of BUSD and CRSS directly from presale view functions to store them in a separate json file 
    const totalBusdDeposited = ethers.utils.formatEther(await contract.methods.totalDepositedBusdBalance().call())
    const totalPresaleCrss = ethers.utils.formatEther(await contract.methods.totalRewardAmount().call())
    const totalWithdrawn = ethers.utils.formatEther(await contract.methods.totalWithdrawedAmount().call())
    const totalCrssOwed = totalPresaleCrss - totalWithdrawn
    const total = { "addressCount": investors.length, "totalOwed": totalCrssOwed, "totalCrss": totalPresaleCrss, "totalBusd": totalBusdDeposited, "totalWithdrawn": totalWithdrawn }
    let objectArray = []

    //loop through all investors, calculate their CRSS entitlement by substracting users withdrawAmount from his/her totalRewardAmount
    //this handles ALL addresses involved in the presale without possibility for error
    // all withdrawn CRSS tokens that entered circulating supply will be handled in user wallet compensation script
    for (let i = 0; i < investors.length; i++) {

        const userInfo = await contract.methods.userDetail(investors[i]).call()
        let userObject = {}

        userObject.address = investors[i]
        userObject.crssOwed = (ethers.utils.formatEther(userInfo.totalRewardAmount) - ethers.utils.formatEther(userInfo.withdrawAmount))
        objectArray.push(userObject);
    }
    objectArray.sort(sort_by('crssOwed', true, parseInt));
    //write the data to an empty json object array
    fs.appendFileSync(`_snapshot/presale/presaleCRSSEnitlement${round}.json`, JSON.stringify(objectArray))
    fs.appendFileSync(`_snapshot/presale/total${round}.json`, JSON.stringify(total))


}

const main = async () => {
    //takes presale contract address, presale contract abi and round number as inputs
    await getPresaleInfo(presale1, presale1ABI, 1)
    await getPresaleInfo(presale2, presale2ABI, 2)
}

main()

