const fs = require("fs")

const main = () => {
    let data = fs.readFileSync("./_snapshot/user_assets/beforeAttack_masterchef.json")
    data = JSON.parse(data)
    const tokens = Object.keys(data[0].assets)

    const minus = {}
    const minusUsers = {}
    for (let i = 0; i < data.length; i++) {
        for (let j = 0; j < tokens.length; j++) {
            if (Number(data[i].assets[tokens[j]]) < 0) {
                minusUsers[tokens[j]] = minusUsers[tokens[j]] && minusUsers[tokens[j]].length > 0 ? [...minusUsers[tokens[j]], {
                    address: data[i].address,
                    amount: data[i].assets[tokens[j]]
                }] : [{
                    address: data[i].address,
                    amount: data[i].assets[tokens[j]]
                }]

                minus[tokens[j]] = minus[tokens[j]] ? minus[tokens[j]] + Number(data[i].assets[tokens[j]]) : Number(data[i].assets[tokens[j]])
            }
        }
    }
    console.log("Minus: ", minus, minusUsers)
}

main()