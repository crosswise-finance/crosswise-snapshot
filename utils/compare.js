const fs = require("fs")

const main = async () => {
    let buyers = fs.readFileSync(`./_snapshot/report/dipBuy/bnbSeller.json`, "utf-8")
    buyers = JSON.parse(buyers)
    let buyersTime = fs.readFileSync(`./_snapshot/report/dipBuy/bnbSellerTime.json`, "utf-8")
    buyersTime = JSON.parse(buyersTime)

    console.log(buyers.length, buyersTime.length)
}

main()