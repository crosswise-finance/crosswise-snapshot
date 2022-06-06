

const hre = require("hardhat");
const fs = require("fs");
const ethers = require("ethers")
const crosswise1 = require("./crosswise-v1");
const ethereum = require("./ethereum");
// const persistence = require("./persistence");
// const report = require("./report");

//const { transactionFiles, attackBlockNumeber, attackTxHash, knownAccounts, attackBlockNumebr } = require("./crosswise-v1");
// const { DECIMALS, weiToEthEn, weiToEth, ethToWei, uiAddr, myExpectRevert, findEvent, retrieveEvent } = require("./library");

// var theOwner, Alice, Bob, Charlie;

// const zero_address = "0x0000000000000000000000000000000000000000";



async function main() {

    // basefolder = "./_supporting";
    // var sysTxList = crosswise1.getSystemTxList(basefolder);
    // console.log("Total: ", sysTxList.length)
    const rpcProvider = "https://bsc-dataseed2.defibit.io/"; // --------- use Infura
    
    const provider = new ethers.providers.JsonRpcProvider(rpcProvider);
    const blockData = await provider.getTransaction("0x03a305ba724b064c5dd3ea5345871ddf8e362592c0c840cde798919ef6379d74");
    fs.writeFileSync("BLOCK.txt", JSON.stringify(blockData)) 

    // ethereum.getOrderedSystemTxList(0, sysTxList, crosswise1.attackTxHash, rpcProvider);
    // var orderedSysTxList = fs.readFileSync("orderTx-xcrss.txt", 'utf-8');
    // orderedSysTxList = "[" + orderedSysTxList.split("\n").join(",").toString() + "]"
    // orderedSysTxList = JSON.parse(orderedSysTxList)
    // ethereum.populateSysTxListWithArguments(0, orderedSysTxList.length, orderedSysTxList, rpcProvider);
    
    // To get mint amount of claim V11 Function through the data from all the transfers
    // getClaimV11History()
    
    // var txs = fs.readFileSync("Final.txt", 'utf-8');
    // txs = "[" + txs.trim().split("\n").join(",").toString() + "]"
    // txs = JSON.parse(txs)
    
    // var contracts = await crosswise1.deployContracts('hardhat');
    // var userHistory = await ethereum.applySystemTxes(contracts, txs);
    // var snapshots = await crosswise1.takeSanpshots(contracts);

    // persistence.saveSnapshots(snapshots);
    // persistence.saveUserHistory(userHistory);
    // const transfers = crosswise1.readTransfers()
    // crosswise1.searchExternalTxs(txs, transfers)
    // crosswise1.orderTransfers(txs, transfers, rpcProvider, 'orderedTransfers.txt')
    // fs.writeFileSync("orderedTransfers.json", orderedTransfers)

    // reports = report.generateUserReports(userHistory);

    // console.log("main...", crosswise1.transactionFiles, crosswise1.attackBlockNumebr, crosswise1.attackTxHash, crosswise1.knownAccounts.CRSS_BNB);   
}

function getClaimV11History() {
    let crssTransfer = fs.readFileSync("./_supporting/CRSSV11.json", "utf-8");
    crssTransfer = JSON.parse(crssTransfer);

    const transferTxList = crssTransfer.map(c => c.transactionHash)

    let orderedSysTxList = fs.readFileSync("orderTxWithParams.txt", 'utf-8');
    orderedSysTxList = "[" + orderedSysTxList.split("\n").toString() + "]"
    orderedSysTxList = JSON.parse(orderedSysTxList)
    // orderedSysTxList = orderedSysTxList.filter(c => c.Method == "claimV1Token");

    for (let i=0;i<orderedSysTxList.length; i++) {
        if (orderedSysTxList[i].Method == "claimV1Token") {
            const txHis = orderedSysTxList[i];
            const index = transferTxList.indexOf(txHis.Txhash);
    
            let amount;
            if (index < 0) {
                // throw(`index 0 ${i}`)
                amount = ethers.utils.parseEther("0");
            } else {
                const crssHis = crssTransfer[index].args
                amount = crssHis[2]
            }
            orderedSysTxList[i].params = [amount]
        }
        fs.appendFileSync("orderWithClaimAmount.txt", JSON.stringify(orderedSysTxList[i]) + "\n")
    }

}

function writeBalancesToExcel(balances, filename) {

    var csv = 'Account, Contract, Balance_wei, Balance_CRSS\n';
    balances.forEach(function (row) {
        console.log(row)
        if (true) {  //row[1] != 0 ) {
            csv += `${row[0]}, `;

            var contract = " ";
            for (i = 0; i < Object.values(knownAccounts).length; i++) {
                if (row[0] == Object.values(knownAccounts)[i]) {
                    contract = Object.keys(knownAccounts)[i];
                    break;
                }
            }
            csv += contract + ",";
            try {
                csv += ` ${row[1]},`;
                csv += ` ${library.weiToEth(row[1])},`;
                csv += "\n";
            } catch (err) {
                console.log("Wei To Eth Error".red, err, "\n", row)
            }
        }
    });

    fs.writeFileSync(filename, csv);
}


function writeTransfersToExcel(transfers, filename) {

    var csv = 'Sender, Contract, Recipient, Contract, Amount_wei, Amount_CRSS\n';
    transfers.forEach(function (row) {
        if (true) {  //row[1] != 0 ) {
            csv += `${row[0]}, `;
            var contract = " ";
            for (i = 0; i < Object.values(knownAccounts).length; i++) {
                if (row[0] == Object.values(knownAccounts)[i]) {
                    contract = Object.keys(knownAccounts)[i];
                    break;
                }
            }
            csv += contract + ",";

            csv += `${row[1]}, `;
            var contract = " ";
            for (i = 0; i < Object.values(knownAccounts).length; i++) {
                if (row[1] == Object.values(knownAccounts)[i]) {
                    contract = Object.keys(knownAccounts)[i];
                    break;
                }
            }
            csv += contract + ",";
            try {
                csv += ` ${Number(row[2].hex)},`;
                csv += ` ${library.weiToEth(row[2].hex)},`;
                csv += "\n";
            } catch (err) {
                console.log("Wei To Eth Error".red, err, "\n", row, row[2])

            }
        }
    });

    fs.writeFileSync(filename, csv);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
