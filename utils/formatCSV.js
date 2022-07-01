const fs = require("fs")

const bnbPrice = 470

const main = () => {
    formatCSV("./_snapshot/report/dipBuy/bnbSellerTime", true)
    formatCSV("./_snapshot/report/dipBuy/busdSellerTime", false)
}

const formatCSV = (file, bnb) => {

    let data = fs.readFileSync(`${file}.json`, "utf-8")
    data = JSON.parse(data)

    let csvData = "Account,BNBAmount,CrssAmount,Price,Time\n"
    for (let i = 0; i < data.length; i++) {
        const price = bnb ? (bnbPrice * data[i].bnb / data[i].amount) : data[i].busd / data[i].amount
        const sold = bnb ? data[i].bnb : data[i].busd
        csvData += data[i].account + "," + bnb ? sold.toFixed(5) : sold.toFixed(5) + ',' + data[i].amount.toFixed(5) + "," + price.toFixed(5) + "," + formatTimer(data[i].createdAt) + '\n'

    }
    fs.writeFileSync(`${file}.csv`, csvData)
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