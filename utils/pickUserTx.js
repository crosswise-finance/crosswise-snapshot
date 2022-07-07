const fs = require("fs")
const ethers = require("ethers")

const account = "0xefcC5406D1354d668a25A418629Cd83c2d185aEA"
const token = "0x99FEFBC5cA74cc740395D65D384EDD52Cb3088Bb"
const main = async () => {
    let transfers = fs.readFileSync("./_snapshot/transfer/orderedTransfers.json")
    transfers = JSON.parse(transfers)

    console.log("Total Transfers: ", transfers.length)
    transfers = transfers.filter((transfer) => transfer.address.toLowerCase() == token.toLowerCase() && (transfer.args[0].toLowerCase() == account.toLowerCase() || transfer.args[1].toLowerCase() == account.toLowerCase()))

    console.log("User transfers: ", transfers.length)
    let txs = []
    transfers.forEach((transfer) => {
        if (txs.indexOf(transfer.transactionHash) < 0) txs.push(transfer.transactionHash)
    })

    console.log("Total Txs: ", txs.length)
    console.log(txs)
}

main()