const fs = require("fs");
const { presale1, presale2 } = require("../scripts/constants")
const ethers = require("ethers")
const colors = require("colors")

const crssPrice = 1.26;
const lpPrice = {
    BNB_ADA: 39.6,
    BNB_BTCB: 8470.1,
    BNB_BUSD: 40.85,
    BNB_CAKE: 119,
    BNB_DOT: 175.4,
    BNB_ETH: 2302.1,
    BNB_LINK: 158.5,
    USDT_BUSD: 2,
}

const deadAddress = "0x000000000000000000000000000000000000dead"

const lpAddr = {
    CRSS_BNB: "0xb5d85cA38a9CbE63156a02650884D92A6e736DDC",
    CRSS_BUSD: "0xB9B09264779733B8657b9B86970E3DB74561c237",
    CRSS_USDT: "0x21d398F619a7A97e0CAb6443fd76Ef702B6dCE8D"
}

const excludeAddr = [
    "0x70873211CB64c1D4EC027Ea63A399A7d07c4085B".toLowerCase(), // Masterchef

    "0x530B338261F8686e49403D1b5264E7a1E169F06b".toLowerCase(), // Exploiter contract
    "0x748346113b6d61870aa0961c6d3fb38742fc5089".toLowerCase(), // Exploiter

    "0xb5d85cA38a9CbE63156a02650884D92A6e736DDC".toLowerCase(), // Crss-bnb
    "0xB9B09264779733B8657b9B86970E3DB74561c237".toLowerCase(), // Crss-busd
    "0x21d398F619a7A97e0CAb6443fd76Ef702B6dCE8D".toLowerCase(), // Crss-usdt
    "0x8151D70B5806E3C957d9deB8bbB01352482a4741".toLowerCase(), // Bnb-Eth
    "0xDE0356A496a8d492431b808c758ed5075Dd85040".toLowerCase(), // Bnb-Ada
    "0x290E1ad05b4D906B1E65B41e689FC842C9962825".toLowerCase(), // Bnb-Busd
    "0x278D7d1834E008864cfB247704cF34a171F39a2C".toLowerCase(), // Bnb-Link
    "0x9Ba0DcE71930E6593aB34A1EBc71C5CebEffDeAF".toLowerCase(), // Bnb-Btcb
    "0xef5be81A2B5441ff817Dc3C15FEF0950DD88b9bD".toLowerCase(), // Busd-usdt
    "0x0458498C2cCbBe4731048751896A052e2a5CC041".toLowerCase(), // Bnb-Cake
    "0xCB7Ad3af3aE8d6A04ac8ECA9a77a95B2a72B06DE".toLowerCase(), // Bnb-Dot
    "0x8B6e0Aa1E9363765Ea106fa42Fc665C691443b63".toLowerCase(), // Crss Router
    "0x27DF46ddd86D9b7afe3ED550941638172eB2e623".toLowerCase(), // XCrss
    "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c".toLowerCase(), // WBnb
    "0x47b30B5eD46101473ED2AEc7b9046aaCb6fd4bBC".toLowerCase(), // Factory
    "0x9cbed1220E01F457772cEe3AAd8B94A142fc975F".toLowerCase(), // Pancake Crss-BNB LP
    "0x73C02124d38538146aE2D807a3F119A0fAd3209c".toLowerCase(), // Biswap Crss-BNB LP
    "0x0000000000000000000000000000000000000000"
]

const devWallet = "0x2A479056FaC97b62806cc740B11774E6598B1649".toLowerCase()

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

    calcV1Holder("Crss")
    calcV1Holder("CrssV1")
}

function calcUsdBal(fileName, users, total, fund) {
    const usdBal = []
    const crssKeys = ['CRSS_BNB', 'CRSS_BUSD', 'CRSS_USDT']
    const sumUsd = {
        CRSS: 0,
        XCRSS: 0,
        CRSS_BNB: 0,
        CRSS_BUSD: 0,
        CRSS_USDT: 0,
        BNB_ADA: 0,
        BNB_BTCB: 0,
        BNB_BUSD: 0,
        BNB_CAKE: 0,
        BNB_DOT: 0,
        BNB_ETH: 0,
        BNB_LINK: 0,
        USDT_BUSD: 0
    }
    const sumUsdTotal = {
        CRSS: 0,
        XCRSS: 0,
        CRSS_BNB: 0,
        CRSS_BUSD: 0,
        CRSS_USDT: 0,
        BNB_ADA: 0,
        BNB_BTCB: 0,
        BNB_BUSD: 0,
        BNB_CAKE: 0,
        BNB_DOT: 0,
        BNB_ETH: 0,
        BNB_LINK: 0,
        USDT_BUSD: 0
    }
    for (let i = 0; i < users.length; i++) {
        if (excludeAddr.indexOf(users[i].address.toLowerCase()) >= 0) continue;
        const assets = {}
        let usdTotal = 0
        const keys = Object.keys(users[i].assets)
        for (let j = 0; j < keys.length; j++) {
            if (keys[j] == 'CRSS' || keys[j] == 'XCRSS') {
                const bal = users[i].assets[keys[j]] * crssPrice
                assets[keys[j]] = bal
                usdTotal += bal

                sumUsdTotal[keys[j]] += bal

                if (users[i].address.toLowerCase() != devWallet)
                    sumUsd[keys[j]] += bal
            }
            else if (crssKeys.indexOf(keys[j]) >= 0) {
                const bal = users[i].assets[keys[j]] * fund[keys[j]] / total[keys[j]]
                assets[keys[j]] = bal
                usdTotal += bal
                sumUsdTotal[keys[j]] += bal
                if (users[i].address.toLowerCase() != devWallet)
                    sumUsd[keys[j]] += bal
            }
            else {
                const bal = users[i].assets[keys[j]] * lpPrice[keys[j]]
                assets[keys[j]] = bal
                usdTotal += bal
                sumUsdTotal[keys[j]] += bal
                if (users[i].address.toLowerCase() != devWallet)
                    sumUsd[keys[j]] += bal
            }
        }
        assets.total = usdTotal
        usdBal.push({
            address: users[i].address,
            assets
        })
    }
    usdBal.sort((a, b) => (b.assets.crss_bnb - a.assets.crss_bnb))
    fs.writeFileSync(`_snapshot/report/Sum_USD_${fileName}.json`, JSON.stringify(usdBal))
    console.log("\nSum USD for Total: ".blue, sumUsdTotal)
    console.log("\nSum USD for Users: ".blue, sumUsd)

}

function calcPoolState(users) {
    const keys = ['CRSS_BNB', 'CRSS_BUSD', 'CRSS_USDT']
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
        const crssBal = users[lpIndex].assets.CRSS
        console.log("LP State: ".green, keys[j], total, crssBal)
        const fund = crssBal * crssPrice * 2
        totalInfo[keys[j]] = total
        fundInfo[keys[j]] = fund
    }
    return { totalInfo, fundInfo }
}

function getAssetInfo(fileName) {
    let walletData = fs.readFileSync(`_snapshot/user_assets/${fileName}.json`)
    let masterchefData = fs.readFileSync(`_snapshot/user_assets/${fileName}_masterchef.json`)
    walletData = JSON.parse(walletData)
    masterchefData = JSON.parse(masterchefData)
    console.log(walletData.length, masterchefData.length)

    // Summarize asset info
    for (let i = 0; i < walletData.length; i++) {
        if (excludeAddr.indexOf(walletData[i].address.toLowerCase()) >= 0) continue;
        const keys = Object.keys(walletData[i].assets)
        for (let j = 0; j < keys.length; j++) {
            walletData[i].assets[keys[j]] = Number(walletData[i].assets[keys[j]])
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

    fs.writeFileSync(`_snapshot/report/Sum_balance_${fileName}.json`, JSON.stringify(users))
    return users;
}

function calcV1Holder(version) {
    const path = `./_supporting/${version}Holders.csv`
    let data = fs.readFileSync(path, 'utf-8')
    data = data.replace(/"/g, "")
    list = data.trim().split("\n")
    list = list.slice(1)
    const users = []
    let total = 0

    list.forEach(info => {
        const user = info.trim().split(",")
        if (user.length == 3 && user[0].toLowerCase() != presale1.toLowerCase() && user[0].toLowerCase() != presale2.toLowerCase() && user[0].toLowerCase() != deadAddress) {
            users.push({
                address: user[0],
                amount: user[1]
            })

            total += Number(user[1])
        }
    })

    users.sort((a, b) => Number(b.amount) - Number(a.amount))

    console.log(`Total ${version} holders: `, users.filter(u => Number(u.amount) > 0.00000001).length, total)
    fs.writeFileSync(`./_snapshot/report/${version}holder.json`, JSON.stringify(users))
}

main()