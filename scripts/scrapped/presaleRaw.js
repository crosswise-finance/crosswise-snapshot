//const { Contract } = require("ethers")
const fs = require("fs")
const Web3 = require('web3')
const Contract = require('web3-eth-contract')
const { presale1, presale2 } = require("./constants")
const presale_abi = require("../_supporting/abi_presale1.json")
const presale2_abi = require("../_supporting/abi_presale2.json")
//const { ethers } = require("ethers")
const web3 = new Web3(new Web3.providers.HttpProvider('https://bsc-dataseed2.defibit.io/'));
/*const userList1 = []
const userEnitlementCRSS1 = []
const userList2 = []
const userEnitlementCRSS2 = []*/

const getPresaleInfo = async (address, abi, round) => {


    //web3.setProvider('https://bsc-dataseed2.defibit.io/')
    // (i.e. ``http:/\/localhost:8545``)
    // const provider = new ethers.providers.JsonRpcProvider("https://bsc-dataseed2.defibit.io/");

    // The provider also allows signing transactions to
    // send ether and pay to change state within the blockchain.
    // For this, we need the account signer...
    // const signer = await provider.getSigner()


    // set provider for all later instances to use

    Contract.setProvider('https://bsc-dataseed2.defibit.io/');
    const contract = new web3.eth.Contract(abi, address);

    let investors = []
    investors = await contract.methods.allInvestors().call()
    let totalBusdDeposited = ethers.utils.formatEther(await contract.methods.totalDepositedBusdBalance().call())
    //console.log(totalBusdDeposited)
    let totalPresaleCrss = ethers.utils.formatEther(await contract.methods.totalRewardAmount().call())
    // console.log(totalPresaleCrss)
    //console.log(investors)


    /*contract.methods.somFunc().send({from: ....})
    .on('receipt', function(){
        ...
    });*/
    // [theOwner] = await ethers.getSigners();
    //presale = new ethers.Contract(address, abi, signer);
    /*   const users = await contract1.allInvestors()
       console.log(`Preale ${round} Users: `, users.length)
   */
    //for (let i = 0; i < investors.length; i++) {
    let total = { addressCount: investors.length, totalOwed: 0, totalCrss: totalPresaleCrss, totalBusd: totalBusdDeposited }
    for (let i = 0; i < investors.length; i++) {
        const userInfo = await contract.methods.userDetail(investors[i]).call()


        /* const user = {}
         user.address = investors[i]
         user.depositTime = Number(userInfo.depositTime)
         user.total = ethers.utils.formatEther(userInfo.totalRewardAmount)
         user.withdrawAmount = ethers.utils.formatEther(userInfo.withdrawAmount)
         user.depositAmount = ethers.utils.formatEther(userInfo.depositAmount)
        */ // console.log(i, userList1)
        let userObject = {}
        userObject.address = investors[i]
        userObject.crssOwed = (ethers.utils.formatEther(userInfo.totalRewardAmount) - ethers.utils.formatEther(userInfo.withdrawAmount))
        total.totalOwed += userObject.crssOwed;

        //fs.appendFileSync(`_snapshot/presale/presale${round}.json`, JSON.stringify(user) + ",")
        fs.appendFileSync(`_snapshot/presale/presaleCRSSEnitlement${round}.json`, JSON.stringify(userObject) + ",")
        //***************
        /*
        if (i == 0) {
            fs.appendFileSync(`_snapshot/presale/presaleCRSSEnitlement${round}.json`, "[" + JSON.stringify(userObject) + ",")
        } else if (i == investors.length - 1) {
            fs.appendFileSync(`_snapshot/presale/presaleCRSSEnitlement${round}.json`, JSON.stringify(userObject) + "]")
        } else
            fs.appendFileSync(`_snapshot/presale/presaleCRSSEnitlement${round}.json`, JSON.stringify(userObject) + ",")
*/

        /*else if (round == 2) {
           userList2.address = investors[i]
           userList2.depositTime = Number(userInfo.depositTime)
           userList2.total = ethers.utils.formatEther(userInfo.totalRewardAmount)
           userList2.withdrawAmount = ethers.utils.formatEther(userInfo.withdrawAmount)
           userList2.depositAmount = ethers.utils.formatEther(userInfo.depositAmount)
           // console.log(i, userList2)
           fs.writeFileSync(`_snapshot/presale/presaleCRSSEnitlement${round}.json`, JSON.stringify(userList2) + ",")
       }*/

        //fs.writeFileSync(`_snapshot/presale/presale${round}.json`, JSON.stringify(user) + ",")//appendFileSync

    }

    fs.appendFileSync(`_snapshot/presale/total${round}.json`, JSON.stringify(total))
}

const main = async () => {
    await getPresaleInfo(presale1, presale_abi, 1)
    await getPresaleInfo(presale2, presale2_abi, 2)
}

main()

/*for (let i = 0; i < 50; i++) {
        const userInfo = await contract.methods.userDetail(investors[i]).call()
        if (round == 1) {

            const user = {}
            user.address = investors[i]
            user.depositTime = Number(userInfo.depositTime)
            user.total = ethers.utils.formatEther(userInfo.totalRewardAmount)
            user.withdrawAmount = ethers.utils.formatEther(userInfo.withdrawAmount)
            user.depositAmount = ethers.utils.formatEther(userInfo.depositAmount)
            // console.log(i, userList1)
            fs.appendFileSync(`_snapshot/presale/presaleCRSSEnitlement${round}.json`, JSON.stringify(user) + ",")
        } */