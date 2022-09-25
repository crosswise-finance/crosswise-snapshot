//for this to work you need presale ABIs stored somewhere, I will add them to Github alongside this script, the presale smart contract addresses should already be in constants.js
//in addition to installing WEB3 and FS ("npm i web3", or "yarn add fs") you might also need to create the _snapshot/presale folder for storing the output data
//run the scripts with "npx hardhat run scripts/getPresaleCompensation.js" or "yarn hardhat -||-"

//importing needed tools
const fs = require("fs")
const Web3 = require('web3')
const Contract = require('web3-eth-contract')
const axios = require('axios').default;

//fetching presale contract addresses and their respective ABIs
const { presale1, presale2 } = require("./constants")
const presale1ABI = require("../_supporting/abi_presale1.json")
const presale2ABI = require("../_supporting/abi_presale2.json")
const oldCrssAddress = "0x0999ba9aea33dca5b615ffc9f8f88d260eab74f1"

const timestamp1 = 14465247 //6:07:59 AM UTC, 18.1.2022 (bscscan)

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
function delay(n) {
    return new Promise(function (resolve) {
        setTimeout(resolve, n * 1000);
    });
}

//this is where we take into account withdraws from presale contracts made after exploit
const adjustForAfterAttackWithdrawals = async (presaleAddress, arr = [], num) => {
    const latest = await web3.eth.getBlockNumber()


    let withdraws = 0
    let withdrawAmountCrss = 0
    let withdrawArr = []
    const options = {
        method: 'GET',
        url: `https://deep-index.moralis.io/api/v2/${presaleAddress}/erc20/transfers?chain=bsc&from_block=${timestamp1}&to_block=${latest - 10000}&limit=100`,
        headers: { Accept: 'application/json', 'X-API-Key': process.env.MORALIS_API }
    };

    axios
        .request(options)
        .then(function (response) {
            const responseArr = (response.data).result;
            withdrawArr = responseArr


            if (responseArr.length >= 100) {

                console.log(`exceeded array length limit ${responseArr.length}`)

            }
        })
        .catch(function (error) {
            console.error(error);

        });
    await delay(1)
    for (let i = 0; i < arr.length; i++) {
        const userAddress = arr[i].address
        for (let x = 0; x < withdrawArr.length; x++) {
            const adjustmentAddress = (withdrawArr[x].to_address).toLowerCase()
            if (userAddress == adjustmentAddress && withdrawArr[x].address == oldCrssAddress && withdrawArr[x].from_address == presaleAddress) {

                const adjustmentAmount = withdrawArr[x].value / 10 ** 18
                arr[i].crssOwed += adjustmentAmount
                withdrawAmountCrss += adjustmentAmount
                withdraws++
            }
        }
    }

    console.log(`Included ${withdraws} withdrawals for a total ${withdrawAmountCrss} CRSS `)
    fs.writeFileSync(`_snapshot/presale/presaleCRSSWithdrawsx${num}.json`, JSON.stringify(withdrawArr))
    fs.writeFileSync(`_snapshot/presale/presaleCRSSWithdraws${num}.json`, JSON.stringify(arr))
    return arr
}

const getPresaleInfo = async (address, abi, round) => {
    //instantiate presale smart contract
    Contract.setProvider('https://bsc-dataseed2.defibit.io/');
    const contract = new web3.eth.Contract(abi, address);

    //create investor array to store return info from allInvestors() view function (returns all addresses involved in the presale)
    let investors = []
    investors = await contract.methods.allInvestors().call()



    let objectArray = []
    //loop through all investors, calculate their CRSS entitlement by substracting users withdrawAmount from his/her totalRewardAmount
    //this handles ALL addresses involved in the presale without possibility for error
    // all withdrawn CRSS tokens that entered circulating supply will be handled in user wallet compensation script
    const inner = async () => {
        for (let i = 0; i < investors.length; i++) {

            const userInfo = await contract.methods.userDetail(investors[i]).call()
            let userObject = {}

            userObject.address = investors[i].toLowerCase()
            const reward = (userInfo.totalRewardAmount) / (10 ** 18)
            const withdrawn = (userInfo.withdrawAmount) / (10 ** 18)
            userObject.crssOwed = reward - withdrawn
            objectArray.push(userObject);
        }
    }
    await inner()

    const adjustedArr = await adjustForAfterAttackWithdrawals(address, objectArray, round)
    adjustedArr.sort(sort_by('crssOwed', true, parseInt));
    //get global values
    let totalOwed = 0
    for (let i = 0; i < adjustedArr.length; i++) {
        totalOwed += adjustedArr[i].crssOwed
    }
    const total = { "addressCount": investors.length, "totalOwed": totalOwed }
    //write the data to an empty json object array
    console.log(`Data for presale ${round}:${totalOwed} CRSS distributed among ${adjustedArr.length} users`)
    fs.writeFileSync(`_snapshot/presale/presaleCRSSEnitlement${round}.json`, JSON.stringify(adjustedArr))
    fs.writeFileSync(`_snapshot/presale/total${round}.json`, JSON.stringify(total))


}



const main = async () => {

    //takes presale contract address, presale contract abi and round number as inputs
    getPresaleInfo(presale1, presale1ABI, 1)
    getPresaleInfo(presale2, presale2ABI, 2)

}

main()