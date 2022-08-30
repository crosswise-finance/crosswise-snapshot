const Web3 = require('web3')
const fs = require('fs')
const contractAddress = "0x70873211CB64c1D4EC027Ea63A399A7d07c4085B"
const contractAbi = require("../_supporting/abi_masterchef.json")
const web3 = new Web3(new Web3.providers.HttpProvider('https://bsc-dataseed2.defibit.io/'))
const jsonAddressListSource = require('../Sum_balance_beforeAttack.json');
let userBalances = []
let userAddresses = []
function getAddressesFromJson(_jsonSource) {

    if (userAddresses.length == 0) {
        for (i = 0; i < _jsonSource.length; i++) {

            userAddresses.push(_jsonSource[i].address);
        }


    }



}
const getUserStakedCrss = async (_addressList = []) => {

    if (userBalances.length == 0) {
        const contract = new web3.eth.Contract(contractAbi, contractAddress);
        console.log(userBalances.length)
        for (i = 0; i < _addressList.length; i++) {
            let userObject = { "address": _addressList[i], "crssStaked": 0 }
            let userStakedBalance = await contract.methods.userInfo(0, _addressList[i]).call()
            userObject.crssStaked = userStakedBalance
            fs.appendFileSync('_snapshot/stakingCrss/users.json', JSON.stringify(userObject))

            userBalances.push(userObject)
        }

    }
    console.log(userBalances.length)

}
const main = async () => {
    //getUserStakedCrss("0x6F9ceE855cB1F362F31256C65e1709222E0f2037")
    /* if (userAddresses.length == 0) {
         getAddressesFromJson(jsonAddressListSource)
     }
     console.log(userAddresses.length)
     console.log(userAddresses[5])
     console.log(userAddresses[120])
     //getAddressesFromJson(jsonAddressListSource);
     getUserStakedCrss(userAddresses)*/
    console.log(1000000000000000000 / 1e18)
    // let totalBusdDeposited = ethers.utils.formatEther(await contract.methods.totalDepositedBusdBalance().call())

}
// for this to work, the objects have to contain one address each at property name "address", adjust if the property name is different 


main()