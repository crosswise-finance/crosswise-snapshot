const fs = require("fs")

// const crss = "0x99FEFBC5cA74cc740395D65D384EDD52Cb3088Bb"

// var txs = fs.readFileSync("orderWithClaimAmount.txt", 'utf-8');
// txs = "[" + txs.split("\n").join(",").toString() + "]"
// txs = JSON.parse(txs)

// const newTxs  = txs.filter(tx => tx.Method == "addLiquidity" && tx.params.indexOf(crss) >= 0)

// // Find Different Token Pair for Crss
// let tokens = []
// newTxs.forEach(tx => {
//     if (tokens.indexOf(tx.params[0]) < 0 && tx.params[0] != crss) {
//         tokens.push(tx.params[0])
//     }
//     if (tokens.indexOf(tx.params[1]) < 0 && tx.params[1] != crss) {
//         tokens.push(tx.params[1])
//     }
// })

// for (let i =0; i< tokens.length; i++) {
//     for (let j=0; j < txs.length; j++) {
//         if (txs[j].Method == "addLiquidity" && txs[j].params.indexOf(crss) >= 0) {
//             if( txs[j].params.indexOf(tokens[i]) >= 0 && txs[j].params.indexOf(crss) >= 0) {
//                 console.log(j)
//                 console.log(txs[j].params);
//                 break;
//             }
//         }
//     }
// }
// // for (let j=0; j < txs.length; j++) {
// //     console.log(txs[j].params[0], txs[j].params[1])
// //     // if( txs[j].params.indexOf(tokens[i]) > 0) {
// //     //     console.log(txs[j].params);
// //     //     break;
// //     // }
// // }
// console.log(tokens)


var txs = fs.readFileSync("Final.txt", 'utf-8');
txs = "[" + txs.trim().split("\n").join(",").toString() + "]"
txs = JSON.parse(txs)
var total = 0
for (let i=0;i<txs.length -1;i++) {
    if (txs[i].Txhash == txs[i+1].Txhash) {
        console.log(i)
        total ++;
    }
}
console.log("Total: ", total)