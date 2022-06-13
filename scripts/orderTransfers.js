const fs = require("fs");
const ethers = require("ethers")
const utils = require("./utils");
const ethereum = require("./ethereum")

async function main() {

    const basefolder = "./_supporting";
    const sysTxList = utils.getSystemTxList(basefolder);
    const rpcProvider = "https://bsc-dataseed2.defibit.io/"; // --------- use Infura

    const orderTxPath = './_snapshot/transactions/orderedTx.json'
    const txs = await ethereum.getOrderedSystemTxList(0, sysTxList, utils.attackTxHash, rpcProvider, orderTxPath);
    // const orderedSysTxList = fs.readFileSync("orderTx-xcrss.txt", 'utf-8');
    // orderedSysTxList = "[" + orderedSysTxList.split("\n").join(",").toString() + "]"
    // orderedSysTxList = JSON.parse(orderedSysTxList)
    // ethereum.populateSysTxListWithArguments(0, orderedSysTxList.length, orderedSysTxList, rpcProvider);

    // To get mint amount of claim V11 Function through the data from all the transfers
    // getClaimV11History()

    // const txs = fs.readFileSync("Final.txt", 'utf-8');
    // txs = "[" + txs.trim().split("\n").join(",").toString() + "]"
    // txs = JSON.parse(txs)

    console.log("Total Transactions", txs.length)

    // const contracts = await utils.deployContracts('hardhat');
    // const userHistory = await ethereum.applySystemTxes(contracts, txs);
    // const snapshots = await utils.takeSanpshots(contracts);

    // persistence.saveSnapshots(snapshots);
    // persistence.saveUserHistory(userHistory);
    const transfers = utils.readTransfers()
    utils.searchExternalTxs(txs, transfers)
    utils.orderTransfers(txs, transfers, rpcProvider, 'orderedTransfers.txt')
    fs.writeFileSync("_snapshot/trnasfer/orderedTransfers.json", orderedTransfers)

    // reports = report.generateUserReports(userHistory);

    // console.log("main...", utils.transactionFiles, utils.attackBlockNumebr, utils.attackTxHash, utils.knownAccounts.CRSS_BNB);   
}

function getClaimV11History() {
    let crssTransfer = fs.readFileSync("./_supporting/CRSSV11.json", "utf-8");
    crssTransfer = JSON.parse(crssTransfer);

    const transferTxList = crssTransfer.map(c => c.transactionHash)

    let orderedSysTxList = fs.readFileSync("orderTxWithParams.txt", 'utf-8');
    orderedSysTxList = "[" + orderedSysTxList.split("\n").toString() + "]"
    orderedSysTxList = JSON.parse(orderedSysTxList)
    // orderedSysTxList = orderedSysTxList.filter(c => c.Method == "claimV1Token");

    for (let i = 0; i < orderedSysTxList.length; i++) {
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

    const csv = 'Account, Contract, Balance_wei, Balance_CRSS\n';
    balances.forEach(function (row) {
        console.log(row)
        if (true) {  //row[1] != 0 ) {
            csv += `${row[0]}, `;

            const contract = " ";
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

    const csv = 'Sender, Contract, Recipient, Contract, Amount_wei, Amount_CRSS\n';
    transfers.forEach(function (row) {
        if (true) {  //row[1] != 0 ) {
            csv += `${row[0]}, `;
            let contract = " ";
            for (i = 0; i < Object.values(knownAccounts).length; i++) {
                if (row[0] == Object.values(knownAccounts)[i]) {
                    contract = Object.keys(knownAccounts)[i];
                    break;
                }
            }
            csv += contract + ",";

            csv += `${row[1]}, `;
            contract = " ";
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
