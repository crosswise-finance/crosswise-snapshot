const fs = require("fs")

const eligibleTime = 18

const main = () => {

    const bnbBuy = formatBNB("./_snapshot/report/dipBuy/bnbSellerTime")
    const busdBuy = formatCSV("./_snapshot/report/dipBuy/busdSellerTime")
    const usdtBuy = formatCSV("./_snapshot/report/dipBuy/usdtSellerTime")

    console.log(bnbBuy.length, busdBuy.length, usdtBuy.length, [...bnbBuy, ...busdBuy, ...usdtBuy].length)
    const buys = sumUpMoves([...bnbBuy, ...busdBuy, ...usdtBuy], true)

    const bnbSell = formatBNB("./_snapshot/report/dipSell/bnbSellerTime")
    const busdSell = formatCSV("./_snapshot/report/dipSell/busdSellerTime")
    const usdtSell = formatCSV("./_snapshot/report/dipSell/usdtSellerTime")

    console.log(bnbSell.length, busdSell.length, usdtSell.length, [...bnbSell, ...busdSell, ...usdtSell].length)
    const sells = sumUpMoves([...bnbSell, ...busdSell, ...usdtSell], false)

    const data = sumUpDips(buys, sells)

    console.log("Total Users: ", data.length)
}

const sumUpDips = (buys, sells) => {
    let users = []

    for (let i = 0; i < buys.length; i++) {
        users.push({
            account: buys[i].account,
            busdBuy: buys[i].busd,
            crssBuy: buys[i].crss,
        })
    }

    for (let i = 0; i < sells.length; i++) {
        const index = users.map(u => u.account).indexOf(sells[i].account)
        if (index >= 0) {
            users[i].busdSell = sells[i].busd
            users[i].crssSell = sells[i].crss
        }
    }

    let csvData = "Wallet, Total Buys Amount(BUSD), Total Buys Amount(CRSS), Total Sells Amount(BUSD), Total Sells Amount(CRSS)\n"

    for (let i = 0; i < users.length; i++) {
        csvData += users[i].account + "," + (users[i].busdBuy || 0) + "," + (users[i].crssBuy || 0) + "," + (users[i].busdSell || 0) + "," + (users[i].crssSell || 0) + "\n"
    }

    fs.writeFileSync("./_snapshot/report/DipUsers.csv", csvData)
    return users
}

const sumUpMoves = (moves, buy) => {
    let users = []

    for (let i = 0; i < moves.length; i++) {
        const index = users.map(u => u.account).indexOf(moves[i].account)
        if (buy && inEligible(moves[i].createdAt)) {
            console.log(formatTimer(moves[i].createdAt))
            continue
        }
        if (!moves[i].sold) {
            console.log(i, moves[i])
            throw ("Erros", i)
        }
        if (index < 0)
            users.push({
                account: moves[i].account,
                busd: Number(moves[i].sold),
                crss: Number(moves[i].amount),
            })
        else {
            users[index].busd += Number(moves[i].sold)
            users[index].crss += Number(moves[i].amount)
        }
    }
    return users
}

const inEligible = (time) => {
    let date = new Date(time * 1000)
    date.setMinutes(date.getMinutes() + date.getTimezoneOffset())
    return date.getDate() === 18 ? false : true
}

const formatCSV = (file) => {

    let data = fs.readFileSync(`${file}.json`, "utf-8")
    data = JSON.parse(data)

    let csvData = "Account,BUSD,CRSS,Price,Time\n"
    for (let i = 0; i < data.length; i++) {
        const price = data[i].sold / data[i].amount
        csvData += data[i].account + "," + data[i].sold + ',' + data[i].amount + "," + price + "," + formatTimer(data[i].createdAt) + '\n'
    }

    fs.writeFileSync(`${file}.csv`, csvData)
    return data
}

const formatBNB = (file) => {

    let prices = fs.readFileSync("./_snapshot/report/bnb-busdPrice.json", "utf-8")
    prices = JSON.parse(prices)

    console.log("Prices: ", prices.length)

    let data = fs.readFileSync(`${file}.json`, "utf-8")
    data = JSON.parse(data)

    let busdData = []
    let csvData = "Account,BUSD,CRSS,Price,Time\n"
    for (let i = 0; i < data.length; i++) {
        const createdAt = data[i].createdAt
        const bnbPrice = pickPrice(createdAt, prices)
        // console.log(`${formatTimer(createdAt)}: $${bnbPrice}`)
        const price = bnbPrice * data[i].sold / data[i].amount
        csvData += data[i].account + "," + data[i].sold * bnbPrice + ',' + data[i].amount + "," + price + "," + formatTimer(data[i].createdAt) + '\n'
        busdData.push({
            ...data[i],
            sold: bnbPrice * data[i].sold
        })
    }

    fs.writeFileSync(`${file}.csv`, csvData)
    return busdData
}

const pickPrice = (createdAt, prices) => {
    let bnbPrice
    let passed = false
    for (let i = 0; i < prices.length; i++) {
        try {

            if (prices[i].time == createdAt) {
                return prices[i].price
            } else if (!passed && prices[i].time > createdAt) {
                return (prices[i].price + prices[i - 1].price) / 2
            }
        } catch (e) {
            console.error(i, createdAt)
        }
    }
    throw (Error(`${createdAt} has no price`))
}

const formatTimer = (time) => {
    let date = new Date(time * 1000)
    date.setMinutes(date.getMinutes() + date.getTimezoneOffset())
    const day = appendZero(date.getDate())
    const hour = appendZero(date.getHours())
    const min = appendZero(date.getMinutes())
    const sec = appendZero(date.getSeconds())

    return `1/${day}/2022 ${hour}:${min}:${sec} +UTC`
}

const appendZero = (data) => {
    if (data < 10) return `0${data}`
    else return data
}

main()