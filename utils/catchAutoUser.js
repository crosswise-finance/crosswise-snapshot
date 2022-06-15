const fs = require("fs")

const main = () => {
    let txs = fs.readFileSync("Final.txt", 'utf-8');
    txs = "[" + txs.trim().split("\n").join(",").toString() + "]"
    txs = JSON.parse(txs)

    const pid = []
    const autoDeposit = txs.filter(tx => tx.Method === 'earn')

    autoDeposit.map((a) => {
        // if (pid.indexOf(a.params[0].hex) < 0) pid.push(a.params[0].hex)
        if (Number(a.params[0].hex) !== 1 && Number(a.params[0].hex) !== 2) {
            console.log(Number(a.params[0].hex), a.Txhash)
        }

    })
    console.log("Auto User number: ", autoDeposit.length, pid)
}

main()