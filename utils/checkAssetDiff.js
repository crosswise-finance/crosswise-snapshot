const fs = require("fs")

const excludeAddr = [
    "0x9cbed1220E01F457772cEe3AAd8B94A142fc975F".toLowerCase(), // Pancake Crss-BNB LP
    "0x73C02124d38538146aE2D807a3F119A0fAd3209c".toLowerCase(), // Biswap Crss-BNB LP
    "0x70873211CB64c1D4EC027Ea63A399A7d07c4085B".toLowerCase(),
    "0x530B338261F8686e49403D1b5264E7a1E169F06b".toLowerCase(),
    "0xb5d85cA38a9CbE63156a02650884D92A6e736DDC".toLowerCase(),
    "0xB9B09264779733B8657b9B86970E3DB74561c237".toLowerCase(),
    "0x21d398F619a7A97e0CAb6443fd76Ef702B6dCE8D".toLowerCase(),
    "0x8151D70B5806E3C957d9deB8bbB01352482a4741".toLowerCase(),
    "0xDE0356A496a8d492431b808c758ed5075Dd85040".toLowerCase(),
    "0x290E1ad05b4D906B1E65B41e689FC842C9962825".toLowerCase(),
    "0x278D7d1834E008864cfB247704cF34a171F39a2C".toLowerCase(),
    "0x9Ba0DcE71930E6593aB34A1EBc71C5CebEffDeAF".toLowerCase(),
    "0xef5be81A2B5441ff817Dc3C15FEF0950DD88b9bD".toLowerCase(),
    "0x0458498C2cCbBe4731048751896A052e2a5CC041".toLowerCase(),
    "0xCB7Ad3af3aE8d6A04ac8ECA9a77a95B2a72B06DE".toLowerCase(),
    "0x8B6e0Aa1E9363765Ea106fa42Fc665C691443b63".toLowerCase(),
    "0x70873211CB64c1D4EC027Ea63A399A7d07c4085B".toLowerCase(),
    "0x27DF46ddd86D9b7afe3ED550941638172eB2e623".toLowerCase(),
    "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c".toLowerCase(),
    "0x47b30B5eD46101473ED2AEc7b9046aaCb6fd4bBC".toLowerCase(),
    "0x0000000000000000000000000000000000000000"
]

async function main() {
    let beforeAttack = fs.readFileSync("Sum_balance_beforeAttack.json",'utf-8')
    let afterAttack = fs.readFileSync("Sum_balance_afterAttack.json",'utf-8')
    let current = fs.readFileSync("Sum_balance_current.json",'utf-8')
    beforeAttack = JSON.parse(beforeAttack)
    afterAttack = JSON.parse(afterAttack)
    current = JSON.parse(current)
    console.log("Users: ", beforeAttack.length, afterAttack.length, current.length)

    let currentTx = fs.readFileSync("./_snapshot/current.json")
    currentTx = JSON.parse(currentTx)

    let beforeAttackTx = fs.readFileSync("./_snapshot/beforeAttack.json")
    beforeAttackTx = JSON.parse(beforeAttackTx)

    const users = []    
    for (let i = 0; i < current.length; i ++) {
        if (excludeAddr.indexOf(current[i].address.toLowerCase()) >= 0) continue
        const index = beforeAttack.map(b => b.address.toLowerCase()).indexOf(current[i].address.toLowerCase())
        if (index < 0) {
            const user = current[i]
            const k = currentTx.map(c => c.address.toLowerCase()).indexOf(user.address.toLowerCase())
            const txs = currentTx[k].history.map(h => h.tx)

            const h = beforeAttackTx.map(c => c.address.toLowerCase()).indexOf(user.address.toLowerCase())
            if (h < 0) {
                user.txs = txs
                users.push(user)
            } else {
                const beforeTxs = beforeAttackTx[h].history.map(h => h.tx)
                const lastIndex = txs.indexOf(beforeTxs[beforeTxs.length - 1])
                user.txs = txs.slice(lastIndex)
                users.push(user)
            }
        } else {
            const keys = Object.keys(current[i].assets);
            const diff = {
                address: current[i].address,
                assets: {

                },
                txs: []
            }
            let diffFlag = false
            for (let j = 0; j < keys.length; j++) {
                const diffVal = current[i].assets[keys[j]] - beforeAttack[index].assets[keys[j]]
                if (diffVal > 0) diffFlag = true
                diff.assets[keys[j]] = diffVal
            }
            const k = currentTx.map(c => c.address.toLowerCase()).indexOf(current[i].address.toLowerCase())
            const txs = currentTx[k].history.map(h => h.tx)
            const h = beforeAttackTx.map(c => c.address.toLowerCase()).indexOf(current[i].address.toLowerCase())
            if (h < 0) {
                diff.txs = txs
            } else {
                const beforeTxs = beforeAttackTx[h].history.map(h => h.tx)
                const lastIndex = txs.indexOf(beforeTxs[beforeTxs.length - 1])
                diff.txs = txs.slice(lastIndex)
            }
            if (diffFlag) users.push(diff)
        }
    }

    console.log("Assets Moved Users: ", users.length)
    fs.writeFileSync("./_snapshot/checkDiff.json", JSON.stringify(users))
}

main()