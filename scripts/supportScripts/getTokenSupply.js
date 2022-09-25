//this gives exact total supply values for each timestamp through BSC Pro Api 
require("dotenv").config();
const { default: axios } = require("axios");
const fs = require("fs");
const pairAddress = "0xb5d85cA38a9CbE63156a02650884D92A6e736DDC"
const crssAddress = "0x99FEFBC5cA74cc740395D65D384EDD52Cb3088Bb"
//exact blocks used as time parameters
const timestamp1 = 14465247 //6:07:59 AM UTC, 18.1.2022 (bscscan)
const timestamp2 = 14471046//max supply of crss minted at 14471047, at 14471046 the supply is still 1.444mil
const timestamp3 = 14471047
const timestamp4 = 14486353 //11:59:58 PM UTC, 18.1.2022 (bscscan)

const getSupplyByBlock = async (timestamp) => {

    let request = await axios.get(`https://api.bscscan.com/api?module=stats&action=tokensupplyhistory&contractaddress=${pairAddress}&blockno=${timestamp}&apikey=${process.env.BSC_PREMIUM_API}`)
    //delay has to exist because most BSC Pro Api requests are limited to 2/sec
    await delay(1);
    let responseData = request.data
    let responseValue = responseData.result / 10 ** 18
    let object = { "timestamp": timestamp, "CRSSTotalSupply": responseValue }
    if (timestamp == timestamp1) {
        fs.appendFileSync("crss_total_supply_history", "[" + JSON.stringify(object) + ",")
    } else if (timestamp == timestamp4) { fs.appendFileSync("crss_total_supply_history", JSON.stringify(object) + "]") }
    else { fs.appendFileSync("crss_total_supply_history", JSON.stringify(object) + ",") }

}
function delay(n) {
    return new Promise(function (resolve) {
        setTimeout(resolve, n * 1000);
    });
}






const main = async () => {


    await getSupplyByBlock(timestamp1)
    await getSupplyByBlock(timestamp2)

    await getSupplyByBlock(timestamp3)
    await getSupplyByBlock(timestamp4)

}

main().catch(() => {
    console.error(error);
    process.exitCode = 1;
});