const fs = require("fs")

const main = () => {
    let users = fs.readFileSync("./_snapshot/user_assets/current.json", 'utf-8')
    users = JSON.parse(users)

    const tokens = Object.keys(users[0].assets)

    for (let i = 0; i < tokens.length; i++) {
        let assetBal = fs.readFileSync(`./_snapshot/collect/${tokens[i]}_balance.json`, 'utf-8')
        assetBal = JSON.parse(assetBal)
        for (let j = 0; j < users.length; j++) {
            if (users[j].address === "0x000000000000000000000000000000000000dEaD") continue
            const index = assetBal.map(a => a.address).indexOf(users[j].address)
            if (index < 0) {
                console.log("no user", users[j].address)
                continue
                // throw ("No user")
            }
            const diff = Number(assetBal[index].balance) - Number(users[j].assets[tokens[i]])
            if (diff != 0)
                console.log(users[j].address, tokens[i], diff)
        }
    }
}

main()