const fs = require("fs");
const { utils } = require("ethers")

const CRSS = "0x99FEFBC5cA74cc740395D65D384EDD52Cb3088Bb"
const ZERO = "0x0000000000000000000000000000000000000000"
const ATTACKER = "0x530B338261F8686e49403D1b5264E7a1E169F06b"

function main() {
    let transfers = fs.readFileSync("./_snapshot/transfer/orderedTransfers.json", 'utf-8');
    transfers = JSON.parse(transfers)
    console.log("Transfers length: ", transfers.length)


    let receives = transfers.filter((a) => a.address === CRSS && a.args[1] === ATTACKER)
    receives = receives.filter(m => utils.formatEther(m.args[2]) > 0)
    receives.sort((a, b) => utils.formatEther(b.args[2]) - utils.formatEther(a.args[2]))

    let saveData = receives.map((m) => ({
        from: m.args[0],
        to: m.args[1],
        amount: utils.formatEther(m.args[2]),
        tx: m.transactionHash,
    }))
    fs.writeFileSync("./_aux/attackerReceive.json", JSON.stringify(saveData))
    console.log("Receive Actions: ", receives.length)
}

main()