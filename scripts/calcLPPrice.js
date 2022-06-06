const fs = require("fs");

const crss = "0x99FEFBC5cA74cc740395D65D384EDD52Cb3088Bb"
const busd = "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56"
const usdc = "0x55d398326f99059fF775485246999027B3197955"
const weth = "0x2170Ed0880ac9A755fd29B2688956BD959F933F8"
const btcb = "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c"
const cake = "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82"
const dot = "0x7083609fCE4d1d8Dc0C979AAb8c869Ea2C873402"
const ada = "0x3EE2200Efb3400fAbB9AacF31297cBdD1d435D47"
const link = "0xF8A0BF9cF54Bb92F17374d9e9A321E6a111a51bD"

const alParams = {
    crssBusd: [crss, busd],
    crssUsdc: [crss, usdc],
    busdUsdc: [busd, usdc],
}
const alEParams = {
    crss,
    weth,
    busd,
    btcb,
    cake,
    dot,
    ada,
    link
}

function main() {
    var txs = fs.readFileSync("Final.txt", 'utf-8');
    txs = "[" + txs.trim().split("\n").join(",").toString() + "]"
    txs = JSON.parse(txs)
    console.log("Transaction length: ", txs.length)

    const price = []
    // find the first add liquidity tx
    let keys = Object.keys(alParams)
    for (let i = 0; i < keys.length; i++) {
        const params = alParams[keys[i]]
        for (let j = 0; j < txs.length; j++) {
            const method = txs[j].Method
            const txParam = txs[j].params
            if (method == "addLiquidity" && txParam.indexOf(params[0]) >= 0 && txParam.indexOf(params[1]) >= 0 ) {
                console.log("LP: ", keys[i], txs[j].Txhash);
                
                break;
            }
        }
    }

    keys = Object.keys(alEParams)
    for (let i = 0; i < keys.length; i++) {
        const params = alEParams[keys[i]]
        for (let j = 0; j < txs.length; j++) {
            const method = txs[j].Method
            const txParam = txs[j].params
            if (method == "addLiquidityETH" && txParam.indexOf(params) == 0) {
                console.log("LP Eth: ", `${keys[i]}-BNB`, txs[j].Txhash);
                break;
            }
        }
    }
}

main()