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

    let round1Total = 0
    let round2Total = 0
    let round1Circle = 0
    let round2Circle = 0

    for (let i = 0; i < presale1.length; i++) {
        round1Total += Number(presale1[i].total)
        round1Circle += Number(presale1[i].withdrawAmount)
    }

    for (let i = 0; i < presale2.length; i++) {
        round2Total += Number(presale2[i].total)
        round2Circle += Number(presale2[i].withdrawAmount)
    }

    for (let i = 0; i < presale1.length; i++) {
        const user = {
            address: presale1[i].address,
            total: Number(presale1[i].total),
            withdraw: Number(presale1[i].withdrawAmount),
            deposit: Number(presale1[i].depositAmount),
            history: [presale1[i]]
        }
        users.push(user)
    }

    for (let j = 0; j < presale2.length; j++) {
        const index = users.map(u => u.address).indexOf(presale2[j].address)
        if (index < 0) {
            const user = {
                address: presale2[j].address,
                total: Number(presale2[j].total),
                withdraw: Number(presale2[j].withdrawAmount),
                deposit: Number(presale2[j].depositAmount),
                history: [presale2[j]]
            }
            users.push(user)
        } else {
            users[index].total += Number(presale2[j].total)
            users[index].withdraw += Number(presale2[j].withdrawAmount)
            users[index].deposit += Number(presale2[j].depositAmount)
            users[index].history.push(presale2[j])
        }
    }

    users.sort((a, b) => b.total - a.total)
    console.log("Final Users: ", users.length);
    fs.writeFileSync("./_snapshot/presale/presaleInfo.json", JSON.stringify(users))

    let total = 0;
    let circulation = 0;
    for (let i = 0; i < users.length; i++) {
        total += users[i].total;
        circulation += users[i].withdraw;
    }

    console.log("Round 1: ", round1Total, round1Circle)
    console.log("Round 2: ", round2Total, round2Circle)
    console.log("Total: ", total, circulation)
}

main()