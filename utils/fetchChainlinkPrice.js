const fs = require("fs")
const { utils } = require("ethers")
// Replace the provider URL with your own Alchemy or Infura endpoint URL
const aggregatorV3InterfaceABI = [{ "inputs": [], "name": "decimals", "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "description", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint80", "name": "_roundId", "type": "uint80" }], "name": "getRoundData", "outputs": [{ "internalType": "uint80", "name": "roundId", "type": "uint80" }, { "internalType": "int256", "name": "answer", "type": "int256" }, { "internalType": "uint256", "name": "startedAt", "type": "uint256" }, { "internalType": "uint256", "name": "updatedAt", "type": "uint256" }, { "internalType": "uint80", "name": "answeredInRound", "type": "uint80" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "latestRoundData", "outputs": [{ "internalType": "uint80", "name": "roundId", "type": "uint80" }, { "internalType": "int256", "name": "answer", "type": "int256" }, { "internalType": "uint256", "name": "startedAt", "type": "uint256" }, { "internalType": "uint256", "name": "updatedAt", "type": "uint256" }, { "internalType": "uint80", "name": "answeredInRound", "type": "uint80" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "version", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }]
const addr = "0x87ea38c9f24264ec1fff41b04ec94a97caf99941"

const main = async () => {
    const [owner] = await ethers.getSigners();

    const prices = []
    const priceFeed = new ethers.Contract(addr, aggregatorV3InterfaceABI, owner)
    // Valid roundId must be known. They are NOT incremental.

    const start = 7078
    const end = 7140

    for (let i = start; i < end; i++) {
        let validId = BigInt(`3689348814741911${i}`)
        const data = await priceFeed.getRoundData(validId)
        prices.push({
            time: Number(data.startedAt),
            price: 1/ utils.formatEther(data.answer)
        })
        console.log(`Price At ${formatTimer(data.startedAt)}: ${1e18 / data.answer}`)
    }
    fs.writeFileSync("./_snapshot/report/bnb-busdPrice.json", JSON.stringify(prices))
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