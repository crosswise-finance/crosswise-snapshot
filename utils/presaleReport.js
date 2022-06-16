const fs = require("fs")

async function main() {
    let presale1 = fs.readFileSync("./_snapshot/presale1.json")
    presale1 = JSON.parse(presale1)

    let presale2 = fs.readFileSync("./_snapshot/presale2.json")
    presale2 = JSON.parse(presale2)
    console.log(presale1.length, presale2.length)

    const users = []
    let vest1 = 0;
    let vest2 = 0;
    for (let i = 0; i < presale1.length; i++) {
        const user = {
            address: presale1[i].address,
            total: Number(presale1[i].total),
            withdraw: Number(presale1[i].withdrawAmount),
            deposit: Number(presale1[i].depositAmount),
            history: [presale1[i]]
        }
        if (presale1[i].depositTime > vest1) {
            vest1 = presale1[i].depositTime
        }
        for (let j = 0; j < presale2.length; j++) {
            if (presale2[j].depositTime > vest2) {
                vest2 = presale2[j].depositTime
            }
            if (presale2[j].address.toLowerCase() == user.address.toLowerCase()) {
                user.total += Number(presale2[j].total)
                user.withdraw += Number(presale2[j].withdrawAmount)
                user.deposit += Number(presale2[j].depositAmount)
                user.history.push(presale2[j])
            }
        }
        users.push(user)
    }
    users.sort((a, b) => b.total - a.total)
    console.log("Final Users: ", users.length);
    console.log("Latest vest: ", vest1, vest2)
    fs.writeFileSync("./_snapshot/presale/presaleInfo.json", JSON.stringify(users))

    let total = 0;
    let circulation = 0;
    for (let i = 0; i < users.length; i++) {
        total += users[i].total;
        circulation += users[i].withdraw;
    }
    console.log("Total: ", total, circulation)
}

main()