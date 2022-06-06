const fs = require("fs");
const ethers = require("ethers")
const colors = require("colors")

const crssPrice = 1.17;
const lpPrice = {
    bnb_ada: 39.6,
    bnb_btcb: 8470.1,
    bnb_busd: 40.85,
    bnb_cake: 119,
    bnb_dot: 175.4,
    bnb_eth: 2302.1,
    bnb_link: 158.5,
    usdc_busd: 2,
}

const lpAddr = {
    crss_bnb: "0xb5d85cA38a9CbE63156a02650884D92A6e736DDC",
    crss_busd: "0xB9B09264779733B8657b9B86970E3DB74561c237",
    crss_usdc: "0x21d398F619a7A97e0CAb6443fd76Ef702B6dCE8D"
}

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
    "0x70873211CB64c1D4EC027Ea63A399A7d07c4085B".toLowerCase(),
    "0x27DF46ddd86D9b7afe3ED550941638172eB2e623".toLowerCase(),
    "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c".toLowerCase(),
    "0x47b30B5eD46101473ED2AEc7b9046aaCb6fd4bBC".toLowerCase(),
    "0x0000000000000000000000000000000000000000"
]

function main() {
    let fileName = "beforeAttack"
    let beforeUsers = getAssetInfo(fileName)
    const { totalInfo, fundInfo } = calcPoolState(beforeUsers)
    console.log("Total: ", totalInfo)
    console.log("Fund: ", fundInfo)
    calcUsdBal(fileName, beforeUsers, totalInfo, fundInfo)

    let afterUsers = getAssetInfo("afterAttack")
    // calcPoolState(afterUsers)
    let currentUsers = getAssetInfo("current")
    // calcPoolState(currentUsers)

    for (let i = 0; i < afterUsers.length; i++) {
        const index = beforeUsers.map(b => b.address).indexOf(afterUsers[i].address)
        if (index < 0) console.log("Attack Account: ", afterUsers[i].address)
    }
}

function calcUsdBal(fileName, users, total, fund) {
    const usdBal = []
    const crssKeys = ['crss_bnb', 'crss_busd', 'crss_usdc']
    const sumUsd = {
        crss: 0,
        crss_bnb: 0,
        crss_busd: 0,
        crss_usdc: 0,
        bnb_ada: 0,
        bnb_btcb: 0,
        bnb_busd: 0,
        bnb_cake: 0,
        bnb_dot: 0,
        bnb_eth: 0,
        bnb_link: 0,
        usdc_busd: 0
    }
    for (let i = 0; i < users.length; i++) {
        if (excludeAddr.indexOf(users[i].address.toLowerCase()) >= 0) continue;
        const assets = {}
        let usdTotal = 0
        const keys = Object.keys(users[i].assets)
        for (let j = 0; j < keys.length; j++) {
            if (keys[j] == 'crss') {
                assets[keys[j]] = users[i].assets[keys[j]] * crssPrice
                usdTotal += users[i].assets[keys[j]] * crssPrice
                if (users[i].address.toLowerCase() != "0x2A479056FaC97b62806cc740B11774E6598B1649".toLowerCase())
                    sumUsd[keys[j]] += users[i].assets[keys[j]] * crssPrice
            }
            else if (crssKeys.indexOf(keys[j]) >= 0) {
                assets[keys[j]] = users[i].assets[keys[j]] * fund[keys[j]] / total[keys[j]]
                usdTotal += users[i].assets[keys[j]] * fund[keys[j]] / total[keys[j]]
                if (users[i].address.toLowerCase() != "0x2A479056FaC97b62806cc740B11774E6598B1649".toLowerCase())
                    sumUsd[keys[j]] += users[i].assets[keys[j]] * fund[keys[j]] / total[keys[j]]
            }
            else {
                assets[keys[j]] = users[i].assets[keys[j]] * lpPrice[keys[j]]
                usdTotal += users[i].assets[keys[j]] * lpPrice[keys[j]]
                if (users[i].address.toLowerCase() != "0x2A479056FaC97b62806cc740B11774E6598B1649".toLowerCase())
                    sumUsd[keys[j]] += users[i].assets[keys[j]] * lpPrice[keys[j]]
            }
        }
        assets.total = usdTotal
        usdBal.push({
            address: users[i].address,
            assets
        })
    }
    usdBal.sort((a, b) => (b.assets.crss_bnb - a.assets.crss_bnb))
    fs.writeFileSync(`Sum_USD_${fileName}.json`, JSON.stringify(usdBal))
    console.log("Sum USD for Users: ".blue, sumUsd)

}

function calcPoolState(users) {
    const keys = ['crss_bnb', 'crss_busd', 'crss_usdc']
    const totalInfo = {}
    const fundInfo = {}
    for (let j = 0; j < keys.length; j++) {
        // Sum up Bal
        let total = 0;
        for (let i = 0; i < users.length; i++) {
            if (excludeAddr.indexOf(users[i].address.toLowerCase()) >= 0) continue;
            total += users[i].assets[keys[j]]
        }
        const lpIndex = users.map(u => u.address.toLowerCase()).indexOf(lpAddr[keys[j]].toLowerCase())
        const crssBal = users[lpIndex].assets.crss
        console.log("LP State: ".green, keys[j], total, crssBal)
        const fund = crssBal * crssPrice * 2
        totalInfo[keys[j]] = total
        fundInfo[keys[j]] = fund
    }
    return { totalInfo, fundInfo }
}

function getAssetInfo(fileName) {
    let walletData = fs.readFileSync(`_snapshot/${fileName}.json`)
    let masterchefData = fs.readFileSync(`_snapshot/${fileName}_masterchef.json`)
    walletData = JSON.parse(walletData)
    masterchefData = JSON.parse(masterchefData)
    console.log(walletData.length, masterchefData.length)

    // Summarize asset info
    for (let i = 0; i < walletData.length; i++) {
        // if (excludeAddr.indexOf(walletData[i].address.toLowerCase()) >= 0) continue;
        const keys = Object.keys(walletData[i].assets)
        for (let j = 0; j < keys.length; j++) {
            walletData[i].assets[keys[j]] = Number(ethers.utils.formatEther(walletData[i].assets[keys[j]]))
        }
    }
    const users = walletData.map(w => ({
        address: w.address,
        assets: w.assets
    }))

    for (let i = 0; i < masterchefData.length; i++) {
        const user = masterchefData[i]
        const index = users.map(u => u.address.toLowerCase()).indexOf(user.address.toLowerCase())
        if (index >= 0) {
            const keys = Object.keys(walletData[i].assets)
            for (let j = 0; j < keys.length; j++) {
                users[index].assets[keys[j]] += Number(user.assets[keys[j]])
            }
        }
    }

    fs.writeFileSync(`Sum_balance_${fileName}.json`, JSON.stringify(users))
    return users;
}

main()