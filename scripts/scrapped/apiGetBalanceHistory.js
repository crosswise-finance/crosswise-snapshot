
/*const { response } = fetch("https://api.bscscan.com/api?module=account&action=tokenbalance&contractaddress=0x0cAE6c43fe2f43757a767Df90cf5054280110F3e&address=0x9ECdb621DC5A26203B6bCD9c074C2B56A7B66B2D&tag=latest&apikey=N1J9Z8NE2RI6P9ZHZH2YGF3CJUGVFGU826").then(function (response) {
   return response.text();
}).then(console.log(response))
let request = new Request.url("https://api.bscscan.com/api?module=account&action=tokenbalance&contractaddress=0x0cAE6c43fe2f43757a767Df90cf5054280110F3e&address=0x9ECdb621DC5A26203B6bCD9c074C2B56A7B66B2D&tag=latest&apikey=N1J9Z8NE2RI6P9ZHZH2YGF3CJUGVFGU826");
fetch(request).then(function (response) {
   return response.text();
}).then(function (text) {
   console.log(text.substring(0, 30));
});*/
/*import fetch from "node-fetch";

const main = async () => {
   fetch("https://api.bscscan.com/api?module=account&action=tokenbalance&contractaddress=0x0cAE6c43fe2f43757a767Df90cf5054280110F3e&address=0x9ECdb621DC5A26203B6bCD9c074C2B56A7B66B2D&tag=latest&apikey=N1J9Z8NE2RI6P9ZHZH2YGF3CJUGVFGU826")
      .then(response => {
         // indicates whether the response is successful (status code 200-299) or not
         if (!response.ok) {+
            throw new Error(`Request failed with status ${reponse.status}`)
         }
         return response.json()
      })
      .then(data => {
         console.log(data.count)
         console.log(data.products)
      })
      .catch(error => console.log(error))
}
main()*/
//const got = require("got")
//const fetch = require("node-fetch");
//this script contains all the eligible token type addresses
require("dotenv").config();
const fs = require("fs");
const tokenConstants = require('./constants.js');
const axios = require('axios').default;
const finalList = require("../_snapshot/holders/finalHolderList1.json");
const finalList1 = require("../_snapshot/holders/1_finalHolderList1.json");
const fullAddressList = require("../_snapshot/holders/currentUsersWalletValueInCRSS.json")

const list = []//list of all addresses and their held tokens
//console.log(tokenAddress.XCRSS)
//this gets us all the token addresses involved
const tokenAddresses = tokenConstants.TokensInScope;
//this give us the names of all involved addresses (addressOfToken1 = tokenAddresses[i] => nameOfToken1 tokenNames[i]), useful for creating 14 separate lists of holders by contract address if needed
const tokenNames = tokenConstants.TokensInScopeName;
const tokenPrices = tokenConstants.TokensInScopePrice;
const crssPrice = 1.26;
const masterchef = "0x70873211CB64c1D4EC027Ea63A399A7d07c4085B"
//exact blocks used as time parameters
const timestamp1 = 14465247 //6:07:59 AM UTC, 18.1.2022 (bscscan)
const timestamp2 = 14486353 //11:59:58 PM UTC, 18.1.2022 (bscscan)
//global aggregated values
let totalObject = { "totalCRSSOwed": 0, "totalAddressAmount": 0, "totalAddressWithMoreThen100CRSS": 0, "totalAddressWithMoreThen1000CRSS": 0 }


//array that stores all eligible wallet addresses from the getAllUserAddresses() function
let users = [];
let fullList = []

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

const getAllUserWalletBalances = async () => {
   for (let i = 0; i < tokenAddresses.length; i++) {
      let contractAddress = tokenAddresses[i]
      await getAllUserAddressesAndCurrentBalanceInCrss(contractAddress)
      await delay(0.5)
   }
   users.sort(sort_by("crssOwed", true, parseInt));
   totalObject.totalAddressAmount = users.length;
   fs.appendFileSync("_snapshot/holders/currentGlobalValuesInCRSS.json", JSON.stringify(totalObject))
   fs.appendFileSync("_snapshot/holders/currentUsersWalletValueInCRSS.json", JSON.stringify(users))
   //fs.appendFileSync("currentUsersWalletValueInCRSS", JSON.stringify(users))

}
//this function gathers all user addresses from all token contract addresses included in compensation, one at a time,
// adding a new address only if it doesn't already exist, ensuring the list contain every unique address that holds at least one of the tokens
const getAllUserAddresses = async (contractAddress, addressList = []) => {
   //api approach
   /*let requestHolders = (await axios.get("https://api.bscscan.com/api?module=token&action=tokenholderlist&contractaddress=contractAddress&page=1&offset=10&apikey=process.env.PRIVATE_API_KEY ")).data;
   const holderList = requestHolders.result;
    for (i = 0; i < holderList.length; i++) {
      let userAddress = holderList[i].TokenHolderAddress
      if (!(users.includes(userAddress))) {
         users.push(userObject)
      }
   }*/
   //approach you can take if you already have several json object arrays,adjust property names accordingly,
   // TokenHolderAddress and TokenHolderQuantity properties are tailored to work with BSC ProApi "Get Token Holder List by Contract Address" request
   //recommend adding an array function input parameter for this approach
   for (i = 0; i < addressList.length; i++) {
      let userAddress = addressList[i].TokenHolderAddress
      if (!(users.includes(userAddress))) {
         users.push(userObject)
      }
   }



}

//for (i = 0; i < object.length; i++) {

// }
//const user = { "address": '', "CRSSOwed": 0 };
//user.CRSSOwed =

/*"result":[
   {
      "TokenHolderAddress":"0x0000000000000000000000000000000000000000",
      "TokenHolderQuantity":"0"
   }, */


//gets us all addresses from any of the target 14(12) tokens to combine into the full address list, also gives current holder amount expressed in their CRSS value equivalent
const getAllUserAddressesAndCurrentBalanceInCrss = async (contractAddress) => {
   //api approach
   let requestHolders = await axios.get(`https://api.bscscan.com/api?module=token&action=tokenholderlist&contractaddress=${contractAddress}&page=1&offset=2000&apikey=${process.env.BSC_PREMIUM_API}`);
   let requestData = requestHolders.data
   const holderList = requestData.result;
   // TokenHolderAddress and TokenHolderQuantity object property names are tailored to work with array response from BSC ProApi "Get Token Holder List by Contract Address" request
   for (let i = 0; i < holderList.length; i++) {

      if (holderList[i].TokenHolderQuantity > 0) {
         let userObject = { "address": holderList[i].TokenHolderAddress, "crssOwed": 0 }
         //this will allow us to automatically convert any token in question to its value equivalent in CRSS 
         let tokenPriceId = tokenAddresses.indexOf(contractAddress);
         let tokenPrice = tokenPrices[tokenPriceId];
         //18 decimals
         let tokenAmount = holderList[i].TokenHolderQuantity
         let tokenValueInCrss = ((tokenAmount / (10 ** 18)) / crssPrice * tokenPrice);
         totalObject.totalCRSSOwed += tokenValueInCrss;
         if (users.includes(holderList[i].TokenHolderAddress)) {
            let arrayIndex = users.indexOf(holderList[i].TokenHolderAddress);
            users[arrayIndex].crssOwed += tokenValueInCrss;

         } else {

            userObject.crssOwed = tokenValueInCrss
            users.push(userObject)
            if (tokenValueInCrss > 1000) {
               totalObject.totalAddressWithMoreThen1000CRSS++;
            }
            if (tokenValueInCrss > 100) {
               totalObject.totalAddressWithMoreThen100CRSS++;
            }
         }


      }

   }
   fs.appendFileSync("_snapshot/holders/test.json", "[" + JSON.stringify(userArray) + "]")

   //for (i = 0; i < object.length; i++) {

   // }
   //const user = { "address": '', "CRSSOwed": 0 };
   //user.CRSSOwed =

   /*"result":[
      {
         "TokenHolderAddress":"0x0000000000000000000000000000000000000000",
         "TokenHolderQuantity":"0"
      }, */


}
const currentUserWalletCRSS = require("../_snapshot/holders/currentUsersWalletValueInCRSS.json")
const currentGlobal = async () => {

}

const tempArray = require("./tempArray.json")
const testArray = []
/////////GET ALL HOLDERS(1500?)
const getAddressesHistoricalBalances = async (timestamp) => {

   for (i = 0; i < tempArray.length; i++) {
      let userObject = { "address": tempArray[i].address, "crssOwed": 0 }
      for (i = 0; i < tokenAddresses.length; i++) {
         let request = await axios.get(`https://api.bscscan.com/api?module=account&action=tokenbalancehistory&contractaddress=${tokenAddresses[i]}&address=${tempArray[i].address}&blockno=${timestamp}&apikey=${process.env.BSC_PREMIUM_API}`);

         let requestData = request.data
         const holderBalance = requestData.result;
         await delay(0.6)

         if (holderBalance > 0) {
            //this will allow us to automatically convert any token in question to its value equivalent in CRSS 

            let tokenPrice = tokenPrices[i];


            let tokenValueInCrss = (holderBalance / (10 ** 18)) / crssPrice * tokenPrice;
            userObject.crssOwed += tokenValueInCrss;


         }
      }
      testArray.push(userObject)
      console.log(`done with ${userObject.address}for ${userObject.crssOwed}`)

   }

   /* for (i = 0; i < tokenAddresses.length; i++) {
       const request = (axios.get("https://api.bscscan.com/api?module=account&action=tokenbalancehistory&contractaddress=tokenAddresses[i]&address=address&blockno=timestamp& apikey=process.env.PRIVATE_API_KEY")).data;
       const tokenName = tokenNames[i];
       const balance = request.result;
       object.[tokenName] = balance;
 
    }*/

}
/*function someFunction() {
   let promises = [];
   for (let i = 0; i < 10; i++) {
      promises.push(asynchonousProcessThatReturnsPromise());
   }
   return Promise.all(promises);
}

someFunction().then(results => {
   // array of results in order here
   console.log(results);
}).catch(err => {
   console.log(err);
});*/
const get = async (arr = []) => {
   for (let i = finalList1.length; i < fullAddressList.length; i++) {

      // here the value of i was passed into as the argument cntr
      // and will be captured in this function closure so each
      // iteration of the loop can have it's own value
      addr = arr[i].address
      await getAddressHistoricalBalances(addr, timestamp2)
      console.log(`done with ${i}`);

   }

   /*function enclosure() {
      for (i = 0; i < arr.length; i++) {
         addr = tempArray[i].address
         getAddressHistoricalBalances(addr, timestamp1)
      }
   }
   enclosure()*/
}
const finalListGlobalValues = async () => {
   let globalObject = { "totalCrssOwed": 0, "totalAddresses": finalList.length }
   for (let i = 0; i < finalList.length; i++) {
      globalObject.totalCrssOwed += finalList[i].crssOwed
   }
   fs.appendFileSync("_snapshot/holders/final1Global.json", JSON.stringify(globalObject))


}
const getAddressHistoricalBalancesCRSS = async (addr, timestamp) => {


   let userObject = { "address": addr, "crssOwed": 0 }
   const innerFunction = async (tokenAddress) => {
      let request = await axios.get(`https://api.bscscan.com/api?module=account&action=tokenbalancehistory&contractaddress=${tokenAddress}&address=${addr}&blockno=${timestamp}&apikey=${process.env.BSC_PREMIUM_API}`);

      let requestData = request.data
      const holderBalance = requestData.result;
      await delay(0.5)


      //this will allow us to automatically convert any token in question to its value equivalent in CRSS 
      let arrayIndex = tokenAddresses.indexOf(tokenAddress);
      let tokenPrice = tokenPrices[arrayIndex];


      let tokenValueInCrss = (holderBalance / (10 ** 18)) / crssPrice * tokenPrice;
      userObject.crssOwed += tokenValueInCrss;
   }
   for (let i = 0; i < tokenAddresses.length; i++) {
      await innerFunction(tokenAddresses[i])
   }
   finalList1.push(userObject)
   fs.writeFileSync("_snapshot/holders/1_finalHolderList1.json", JSON.stringify(finalList1))
   console.log(`done with ${addr}for ${userObject.crssOwed}`)

}
const getAddressHistoricalBalances = async (addr, timestamp) => {

   let contractBalances = []

   const innerFunction = async (tokenAddress) => {
      let request = await axios.get(`https://api.bscscan.com/api?module=account&action=tokenbalancehistory&contractaddress=${tokenAddress}&address=${addr}&blockno=${timestamp}&apikey=${process.env.BSC_PREMIUM_API}`);

      let requestData = request.data
      const holderBalance = (requestData.result) / (10 ** 18);
      await delay(0.5)
      contractBalances.push(holderBalance)
   }
   for (let i = 0; i < tokenAddresses.length; i++) {
      await innerFunction(tokenAddresses[i])
   }
   let userObject = {
      "address": addr, "CRSSV11": contractBalances[0], "CRSSV1": contractBalances[1], "XCRSS": contractBalances[2], "CRSS_BUSD": contractBalances[3], "CRSS_BNB": contractBalances[4],
      "BNB_BUSD": contractBalances[5], "BNB_USDT": contractBalances[6], "BNB_DOT": contractBalances[7],
      "BNB_LINK": contractBalances[8], "BNB_ETH": contractBalances[9], "BNB_ADA": contractBalances[10], "BNB_BTCB": contractBalances[11]
   }
   finalList1.push(userObject)
   fs.writeFileSync("_snapshot/holders/1_finalHolderList1.json", JSON.stringify(finalList1))
   console.log(`done with ${addr}for ${userObject.crssOwed}`)

}

/* for (i = 0; i < tokenAddresses.length; i++) {
    const request = (axios.get("https://api.bscscan.com/api?module=account&action=tokenbalancehistory&contractaddress=tokenAddresses[i]&address=address&blockno=timestamp& apikey=process.env.PRIVATE_API_KEY")).data;
    const tokenName = tokenNames[i];
    const balance = request.result;
    object.[tokenName] = balance;
 
 }*/
const getTokenInfo = async () => {
   let objectArray = []
   for (let i = 0; i < tokenAddresses.length; i++) {
      let request = await axios.get(`https://api.bscscan.com/api?module=token&action=tokeninfo&contractaddress=${tokenAddresses[i]}&apikey=${process.env.BSC_PREMIUM_API}`);
      let requestData = request.data;
      let tokenObject = requestData.result;
      objectArray.push(tokenObject)
      await delay(0.5)
   }
   fs.appendFileSync("_snapshot/tokenInfo.json", "[" + JSON.stringify(objectArray) + "]")
}
const getCurrentCRSSWalletBalances = async () => {
   for (let i = 0; i < fullAddressList.length; i++) {
      await getCurrentCRSSRequest(fullAddressList[i].address)

   }

}
const getCurrentCRSSRequest = async (address) => {
   let request = await axios.get(`https://api.bscscan.com/api?module=account&action=tokenbalance&contractaddress="0x99FEFBC5cA74cc740395D65D384EDD52Cb3088Bb"&address=${address}&tag=latest&apikey=${process.env.BSC_PUBLIC_API}`);
   let requestData = request.data
   let crssBalance = (requestData.result) / (10 ** 18);
   let userObject = { "address": address, "crssOwed": crssBalance }
   fs.appendFileSync("_snapshot/holders/currentCRSSWalletBalances.json", JSON.stringify(userObject) + ",")
}

const getSingleAddressHistoricalBalance = async (address) => {
   let request = await axios.get(`https://api.bscscan.com/api?module=account&action=tokenbalancehistory&contractaddress=${tokenAddresses[0]}&address=${address}&blockno=${timestamp1}&apikey=${process.env.BSC_PREMIUM_API}`);

   let requestData = request.data
   const holderBalance = (requestData.result) / (1000000000000000000);
   console.log(holderBalance)
}



/////////GET ALL HOLDER AMOUNTS FOR 3 TIMESTAMPS and 13 dif tokens (39 per user, over half a mil requests, test with 100 addresses)
const main = async () => {
   // getTokenInfo()
   //get(fullAddressList)
   getSingleAddressHistoricalBalance("0xb5d85ca38a9cbe63156a02650884d92a6e736ddc")
   //finalListGlobalValues()
   //getCurrentCRSSWalletBalances()
   // getAllUserWalletBalances()
   //getAddressHistoricalBalances("0x9cbed1220e01f457772cee3aad8b94a142fc975f", timestamp1)
   //await delay(1)
   //getAddressHistoricalBalances("0xb9b09264779733b8657b9b86970e3db74561c237", timestamp1)
   //await delay(1)
   //getAddressHistoricalBalances("0x000000000000000000000000000000000000dead", timestamp1)
   //await delay(1)
   //getAddressHistoricalBalances("0x27df46ddd86d9b7afe3ed550941638172eb2e623", timestamp1)
}
main()

//main()
//getSmartContractHistoricalBalance(masterchef, timestamp1)
//getSmartContractHistoricalBalance(masterchef, timestamp2)
/* let userss = ["0x2A479056FaC97b62806cc740B11774E6598B1649", "0x2A479056FaC97b62806cc740B11774E6598B1649"]
let targetAddress = "0x2A479056FaC97b62806cc740B11774E6598B1649"
userss.push(targetAddress)

let boolean1 = userss.includes(targetAddress)
console.log(boolean1)

let position = userss.indexOf(targetAddress);
console.log(position)
console.log(userss)
/*if (users.includes(targetAddress)) {
console.log("included")
} else {
console.log("not included")
}
let boolean2 = userss.includes(targetAddress)
console.log(boolean2)
console.log(position)*/
   //let tokenPriceId = tokenPrices.indexOf(contractAddress);
   //let tokenPrice = tokenPrices[tokenPriceId];
   //let tokenValueInCrss = userObject.crssOwed / crssPrice * tokenPrice;
   //users[position].crssOwed += tokenValueInCrss;


   // Make a request for a user with a given ID
/*  axios.get("https://api.bscscan.com/api?module=account&action=tokenbalance&contractaddress=0x0cAE6c43fe2f43757a767Df90cf5054280110F3e&address=0x9ECdb621DC5A26203B6bCD9c074C2B56A7B66B2D&tag=latest&apikey=N1J9Z8NE2RI6P9ZHZH2YGF3CJUGVFGU826")
     .then(function (response) {
        // handle success
        console.log(response);
     })
     .catch(function (error) {
        // handle error
        console.log(error);
     })
     .then(function () {
        // always executed
     });*/
/*let request = await axios.get("https://api.bscscan.com/api?module=account&action=tokenbalance&contractaddress=0x0cAE6c43fe2f43757a767Df90cf5054280110F3e&address=0x9ECdb621DC5A26203B6bCD9c074C2B56A7B66B2D&tag=latest&apikey=N1J9Z8NE2RI6P9ZHZH2YGF3CJUGVFGU826");
console.log(request.data)
const object = request.data;
console.log(object)
console.log(object.result)
console.log(object.length)*/

/*const { data } = await got.post('https://api.bscscan.com/api?module=account&action=tokenbalance&contractaddress=0x0cAE6c43fe2f43757a767Df90cf5054280110F3e&address=0x9ECdb621DC5A26203B6bCD9c074C2B56A7B66B2D&tag=latest&apikey=N1J9Z8NE2RI6P9ZHZH2YGF3CJUGVFGU826', {
   json: {
      hello: 'world'
   }
}).json();

console.log(data);*/
   //=> {"hello": "world"}
   // Hardhat always runs the compile task when running scripts with its command
   // line interface.
   //
   // If this script is run directly using `node` you may want to call compile
   // manually to make sure everything is compiled
   // await hre.run('compile');

   // We get the contract to deploy
/*fetch("https://api.bscscan.com/api?module=account&action=tokenbalance&contractaddress=0x0cAE6c43fe2f43757a767Df90cf5054280110F3e&address=0x9ECdb621DC5A26203B6bCD9c074C2B56A7B66B2D&tag=latest&apikey=N1J9Z8NE2RI6P9ZHZH2YGF3CJUGVFGU826")
   .then(response => {
      // indicates whether the response is successful (status code 200-299) or not
      if (!response.ok) {
         throw new Error(`Request failed with status ${reponse.status}`)
      }
      return response.json()
   })
   .then(data => {
      console.log(data.count)
      console.log(data.products)
   })
   .catch(error => console.log(error))*/

   ////////////////////////////////////////////////////////////////




// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
/*getUsers(tokenAddresses[0]).catch(() => {
   console.error(error);
   process.exitCode = 1;
});*/

//"Powered by BscScan APIs" 

