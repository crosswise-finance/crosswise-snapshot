const fs = require("fs");

const masterchef = "0x70873211CB64c1D4EC027Ea63A399A7d07c4085B"

const excludeAddr = [
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
    "0x27DF46ddd86D9b7afe3ED550941638172eB2e623".toLowerCase(),
    "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c".toLowerCase(),
    "0x47b30B5eD46101473ED2AEc7b9046aaCb6fd4bBC".toLowerCase(),
    "0x0000000000000000000000000000000000000000"
]

function main() {
    const time = ["beforeAttack", "afterAttack", "current"]
    for (let j = 0; j < time.length; j++) {
        let data = fs.readFileSync(`Sum_balance_${time[j]}.json`, 'utf-8');
        data = JSON.parse(data)

        let keys = Object.keys(data[0].assets)

        for (let k = 0; k < keys.length; k++) {
            let key = keys[k]
            const helders = []
            let total = 0;
            for (let i = 0; i < data.length; i++) {
                if (excludeAddr.indexOf(data[i].address.toLowerCase()) >= 0) continue
                if (data[i].assets[key] > 0) {
                    helders.push({
                        address: data[i].address,
                        bal: data[i].assets[key]
                    })
                    total += data[i].assets[key]
                }
            }
            helders.sort((a, b) => b.bal - a.bal)
            fs.writeFileSync(`./helders/Helder_${key}_${time[j]}.json`, JSON.stringify(helders))
            console.log(`${time[j]} ${key} Helder: ${helders.length}, total: ${total}`)
        }
    }
}

main()