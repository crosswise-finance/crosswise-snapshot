const { BigNumber } = require('ethers');
var Web3 = require('web3');
//var web3 = new Web3('http://localhost:8545');
// or
const bscMainnet = "https://bsc-dataseed2.defibit.io/";
const bscTestnet = "https://data-seed-prebsc-1-s1.binance.org:8545/";
const infuraRinkebyHttp = "https://rinkeby.infura.io/v3/e08cb72f7f5f44f491eed56d47b772f9";
var web3 = new Web3(new Web3.providers.HttpProvider(bscTestnet));
const myAddress = "0x9ECdb621DC5A26203B6bCD9c074C2B56A7B66B2D"
web3.eth.getBalance(myAddress)
    .then(console.log);
let request =
    //let num = web3.utils.fromWei(web3.utils.toBN(web3.eth.getBalance(myAddress).toString()), 'ether')
    console.log(num);
    //string(web3.eth.getBalance(myAddress))
