const fs = require("fs");
const { utils } = require("ethers")

const CRSS = "0x99FEFBC5cA74cc740395D65D384EDD52Cb3088Bb"
const ZERO = "0x0000000000000000000000000000000000000000"

function main() {
    var transfers = fs.readFileSync("orderedTransfers.txt", 'utf-8');
    transfers = "[" + transfers.trim().split("\n").join(",").toString() + "]"
    transfers = JSON.parse(transfers)
    console.log("Transfers length: ", transfers.length)


    let mintActions = transfers.filter((a) => a.address === CRSS && a.args[0] === ZERO)
    mintActions = mintActions.filter(m => utils.formatEther(m.args[2]) > 0)
    mintActions.sort((a, b) => utils.formatEther(b.args[2]) - utils.formatEther(a.args[2]))

    let saveData = mintActions.map((m) => ({
        from: m.args[0],
        to: m.args[1],
        amount: utils.formatEther(m.args[2]),
        tx: m.transactionHash,
    }))
    fs.writeFileSync("./_aux/crssmint.json", JSON.stringify(saveData))
    console.log("Mint Actions: ", mintActions.length)
}

main()