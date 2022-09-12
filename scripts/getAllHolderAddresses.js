require("dotenv").config();
const fs = require("fs");
const tokenConstants = require('./constants.js');
const axios = require('axios').default;
//json object arrays containing relevant addresses 
const presaleList1 = require("../_snapshot/presale/presaleCRSSEnitlement1.json")
const presaleList2 = require("../_snapshot/presale/presaleCRSSEnitlement2.json")
const sumBalanceList = require("../utils/Sum_balance_current.json")
const { assert } = require("console");
//this gets us all the token addresses involved
const tokenAddresses = tokenConstants.TokensInScope;

//array used as temp storage for all eligible wallet addresses
let users = [];
//excluded ******************************TO BE RECHECKED***********
const excludedAddr = [
    "0x70873211CB64c1D4EC027Ea63A399A7d07c4085B".toLowerCase(), // Masterchef

    "0x530B338261F8686e49403D1b5264E7a1E169F06b".toLowerCase(), // Exploiter contract
    "0x748346113b6d61870aa0961c6d3fb38742fc5089".toLowerCase(), // Exploiter

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
    "0x8B6e0Aa1E9363765Ea106fa42Fc665C691443b63".toLowerCase(), // Crss Router
    "0x27DF46ddd86D9b7afe3ED550941638172eB2e623".toLowerCase(), // XCrss
    "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c".toLowerCase(), // WBnb
    "0x47b30B5eD46101473ED2AEc7b9046aaCb6fd4bBC".toLowerCase(), // Factory
    "0x9cbed1220E01F457772cEe3AAd8B94A142fc975F".toLowerCase(), // Pancake Crss-BNB LP
    "0x73C02124d38538146aE2D807a3F119A0fAd3209c".toLowerCase(), // Biswap Crss-BNB LP
    "0x000000000000000000000000000000000000dead",
    "0x0000000000000000000000000000000000000000"
]

//we need this to create space between Api Pro requests, since the relevant ones are capped to 2 calls per second
function delay(n) {
    return new Promise(function (resolve) {
        setTimeout(resolve, n * 1000);
    });
}



//this will take any address array as input and output the same array with no duplicates, also excludes marked addresses
function getUniqueArray(arr = []) {
    let uniqueArr = []
    let excludedAddresses = 0;
    let duplicates = 0;

    const lowerCaseArr = arr.map(name => name.toLowerCase())
    for (let i = 0; i < lowerCaseArr.length; i++) {
        const addr = lowerCaseArr[i]
        if (excludedAddr.includes(addr)) {
            excludedAddresses++
        } else if (uniqueArr.includes(addr)) {
            duplicates++;
        } else {
            uniqueArr.push(addr)
        }
    }
    console.log(`Number of starting addresses: ${arr.length}`)
    console.log(`Number of unique addresses: ${uniqueArr.length}`)
    console.log(`Number of duplicates: ${duplicates}`)

    return uniqueArr

}

//gets us all addresses from any of the target 14(12) tokens to combine into the full holder address list
const getAllTokenHolders = async () => {
    let numOfAddresses = 0;

    const InnerFunction = async (contractAddr) => {
        //api approach
        let requestHolders = await axios.get(`https://api.bscscan.com/api?module=token&action=tokenholderlist&contractaddress=${contractAddr}&page=1&offset=2000&apikey=${process.env.BSC_PREMIUM_API}`);
        let requestData = requestHolders.data
        const holderList = requestData.result;
        let addressCount = 0;
        // TokenHolderAddress and TokenHolderQuantity object property names are tailored to work with array response from BSC ProApi "Get Token Holder List by Contract Address" request
        for (let i = 0; i < holderList.length; i++) {
            const userAddr = holderList[i].TokenHolderAddress
            users.push(userAddr)
            addressCount++
            numOfAddresses++
        }
        //make sure the numbers are in order
        assert(addressCount == holderList.length)

    }

    for (let i = 0; i < tokenAddresses.length; i++) {
        let contractAddress = tokenAddresses[i]
        await InnerFunction(contractAddress)
        await delay(0.5)
    }
    console.log(`Added ${numOfAddresses} addresses from all 12 token holders `)
    console.log(`Total number of addresses: ${users.length}`)

}

//gets us all addresses from all relevant json files
const getAllAddresses = async () => {
    await getAllAddressesFromJsons(presaleList1)
    await getAllAddressesFromJsons(presaleList2)
    await getAllAddressesFromJsons(sumBalanceList)
}

const getAllAddressesFromJsons = async (jsonArray = []) => {
    let numOfAdded = 0;
    for (let i = 0; i < jsonArray.length; i++) {
        users.push(jsonArray[i].address)
        numOfAdded++

    }
    console.log(`Added ${numOfAdded} new addresses from json file`)
    assert(numOfAdded == jsonArray.length)
}

function createTotalAddressList() {
    const finalUniqueList = getUniqueArray(users)
    console.log(`Final unique address count: ${finalUniqueList.length}`)
    fs.writeFileSync("_snapshot/fullAddressList.json", JSON.stringify(finalUniqueList))
}

const getFullList = async () => {
    await getAllTokenHolders()
    await getAllAddresses()
    createTotalAddressList()
}
//run with npx hardhat run scripts/getAllHolderAddresses.js
const main = async () => {
    getFullList()

}
main()


