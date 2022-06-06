# Attack Investigation Report

#### Abstraction


## 1. Attack transaciton reported by BscScan.com
The attack transaciton is published at [https://bscscan.com/tx/0xd02e444d0ef7ff063e3c2cecceba67eae832acf3f9cf817733af9139145f479b](https://bscscan.com/tx/0xd02e444d0ef7ff063e3c2cecceba67eae832acf3f9cf817733af9139145f479b)

- Tx hash 0xd02e444d0ef7ff063e3c2cecceba67eae832acf3f9cf817733af9139145f479b
- Block: 14465249
- Timestamp: Jan-18-2022 06:08:05 AM +UTC
- From: 0x748346113b6d61870aa0961c6d3fb38742fc5089 (Crosswise Exploiter)
- Interacted with (To): Contract <0x530b..> (Receiving party of the tranaction)
    TRANSFER  0.002372013299958284 BNB From 0x99fefbc5ca74cc740395d65d384edd52cb3088bb(CRSSv1.1) To  0x8b6e0aa1e9363765ea106fa42fc665c691443b63(Router)
    TRANSFER  0.002372013299958284 BNB From 0x8b6e0aa1e9363765ea106fa42fc665c691443b63(Router) To  Binance: WBNB Token
    TRANSFER  0.002371991316394102 BNB From Binance: WBNB Token To  0x8b6e0aa1e9363765ea106fa42fc665c691443b63(Router)
    TRANSFER  0.002371991316394102 BNB From 0x8b6e0aa1e9363765ea106fa42fc665c691443b63(Router) To  0x99fefbc5ca74cc740395d65d384edd52cb3088bb
    TRANSFER  0.002371991316394102 BNB From 0x99fefbc5ca74cc740395d65d384edd52cb3088bb(CRSSv1.1) To  0x8b6e0aa1e9363765ea106fa42fc665c691443b63(Router)
    TRANSFER  0.002371991316394102 BNB From 0x8b6e0aa1e9363765ea106fa42fc665c691443b63(Router) To  Binance: WBNB Token
    TRANSFER  0.0023719693332374 BNB From Binance: WBNB Token To  0x8b6e0aa1e9363765ea106fa42fc665c691443b63(Router)
    TRANSFER  0.0023719693332374 BNB From 0x8b6e0aa1e9363765ea106fa42fc665c691443b63(Router) To  0x99fefbc5ca74cc740395d65d384edd52cb3088bb
    TRANSFER  0.0023719693332374 BNB From 0x99fefbc5ca74cc740395d65d384edd52cb3088bb(CRSSv1.1) To  0x8b6e0aa1e9363765ea106fa42fc665c691443b63(Router)
    TRANSFER  0.0023719693332374 BNB From 0x8b6e0aa1e9363765ea106fa42fc665c691443b63(Router) To  Binance: WBNB Token
    TRANSFER  119.150453562480096914 BNB From Binance: WBNB Token To  PancakeSwap: Router v2
    TRANSFER  119.150453562480096914 BNB From PancakeSwap: Router v2 To  <0x530b..>
    TRANSFER  119.150453562480096914 BNB From <0x530b..> To  Crosswise Exploiter

- Tokens Transferred: (130)
    From 0x8b6e0aa1e9363765ea106fa42fc665c691443b63To 0xb5d85ca38a9cbe63156a02650884d92a6e736ddc For 0.01 ($4.43) Wrapped BNB (WBNB)
    From 0xb5d85ca38a9cbe63156a02650884d92a6e736ddcTo <0x530b..> For 3.714015207235354417 Crosswise V1... (CRSS)
    From 0xb5d85ca38a9cbe63156a02650884d92a6e736ddcTo 0x2a479056fac97b62806cc740b11774e6598b1649 For 0.001486646735609068 Crosswise V1... (CRSS)
    From 0xb5d85ca38a9cbe63156a02650884d92a6e736ddcTo Null Address: 0x000...dEaD For 0.001114985051706801 Crosswise V1... (CRSS)
    From Null Address: 0x000...000To 0x2a479056fac97b62806cc740b11774e6598b1649 For 0.683111111111111111 Crosswise V1... (CRSS)
    From Null Address: 0x000...000To 0x70873211cb64c1d4ec027ea63a399a7d07c4085b For 7.851851851851851851 Crosswise V1... (CRSS)
    From <0x530b..>To 0x70873211cb64c1d4ec027ea63a399a7d07c4085b For 1 Crosswise V1... (CRSS)
    From 0x70873211cb64c1d4ec027ea63a399a7d07c4085bTo <0x530b..> For 692,184.64155642920078073 Crosswise V1... (CRSS)
    From <0x530b..>To 0x99fefbc5ca74cc740395d65d384edd52cb3088bb For 1.768601850957604578 Crosswise V1... (CRSS)
    From 0x99fefbc5ca74cc740395d65d384edd52cb3088bbTo 0xb5d85ca38a9cbe63156a02650884d92a6e736ddc For 0.884311012118927001 Crosswise V1... (CRSS)
    From 0xb5d85ca38a9cbe63156a02650884d92a6e736ddcTo 0x8b6e0aa1e9363765ea106fa42fc665c691443b63 For 0.00236987147103197 ($1.05) Wrapped BNB (WBNB)
    From 0x99fefbc5ca74cc740395d65d384edd52cb3088bbTo 0xb5d85ca38a9cbe63156a02650884d92a6e736ddc For 0.882546480202759824 Crosswise V1... (CRSS)
    From 0x8b6e0aa1e9363765ea106fa42fc665c691443b63To 0xb5d85ca38a9cbe63156a02650884d92a6e736ddc For 0.00236987147103197 ($1.05) Wrapped BNB (WBNB)
    From Null Address: 0x000...000To 0x99fefbc5ca74cc740395d65d384edd52cb3088bb For 0.045354603081566195 Crosswise LP... (Crss-L...)
    From <0x530b..>To 0xb9b09264779733b8657b9b86970e3db74561c237 For 5,889.444163688823245113 Crosswise V1... (CRSS)
    From <0x530b..>To 0x2a479056fac97b62806cc740b11774e6598b1649 For 2.357428360536423062 Crosswise V1... (CRSS)
    From <0x530b..>To Null Address: 0x000...dEaD For 1.768071270402317296 Crosswise V1... (CRSS)
    From 0xb9b09264779733b8657b9b86970e3db74561c237To <0x530b..> For 7,065.960047194080950828 ($7,059.81) Binance-Peg ... (BUSD)
    From <0x530b..>To 0x99fefbc5ca74cc740395d65d384edd52cb3088bb For 1.768601850957604578 Crosswise V1... (CRSS)
    From 0x99fefbc5ca74cc740395d65d384edd52cb3088bbTo 0xb5d85ca38a9cbe63156a02650884d92a6e736ddc For 0.885183191436885878 Crosswise V1... (CRSS)
    From 0xb5d85ca38a9cbe63156a02650884d92a6e736ddcTo 0x8b6e0aa1e9363765ea106fa42fc665c691443b63 For 0.00237218685429152 ($1.05) Wrapped BNB (WBNB)
    From 0x99fefbc5ca74cc740395d65d384edd52cb3088bbTo 0xb5d85ca38a9cbe63156a02650884d92a6e736ddc For 0.883416923196107387 Crosswise V1... (CRSS)
    From 0x8b6e0aa1e9363765ea106fa42fc665c691443b63To 0xb5d85ca38a9cbe63156a02650884d92a6e736ddc For 0.00237218685429152 ($1.05) Wrapped BNB (WBNB)
    From Null Address: 0x000...000To 0x99fefbc5ca74cc740395d65d384edd52cb3088bb For 0.045399125073032612 Crosswise LP... (Crss-L...)
    From <0x530b..>To 0xb9b09264779733b8657b9b86970e3db74561c237 For 5,889.444163688823245113 Crosswise V1... (CRSS)
    From <0x530b..>To 0x2a479056fac97b62806cc740b11774e6598b1649 For 2.357428360536423062 Crosswise V1... (CRSS)
    From <0x530b..>To Null Address: 0x000...dEaD For 1.768071270402317296 Crosswise V1... (CRSS)
    From 0xb9b09264779733b8657b9b86970e3db74561c237To <0x530b..> For 6,439.72814571907858992 ($6,434.13) Binance-Peg ... (BUSD)
    From <0x530b..>To 0x99fefbc5ca74cc740395d65d384edd52cb3088bb For 1.768601850957604578 Crosswise V1... (CRSS)
    From 0x99fefbc5ca74cc740395d65d384edd52cb3088bbTo 0xb5d85ca38a9cbe63156a02650884d92a6e736ddc For 0.885184059599191534 Crosswise V1... (CRSS)
    From 0xb5d85ca38a9cbe63156a02650884d92a6e736ddcTo 0x8b6e0aa1e9363765ea106fa42fc665c691443b63 For 0.002372167193999869 ($1.05) Wrapped BNB (WBNB)
    From 0x99fefbc5ca74cc740395d65d384edd52cb3088bbTo 0xb5d85ca38a9cbe63156a02650884d92a6e736ddc For 0.883417789592142859 Crosswise V1... (CRSS)
    From 0x8b6e0aa1e9363765ea106fa42fc665c691443b63To 0xb5d85ca38a9cbe63156a02650884d92a6e736ddc For 0.002372167193999869 ($1.05) Wrapped BNB (WBNB)
    From Null Address: 0x000...000To 0x99fefbc5ca74cc740395d65d384edd52cb3088bb For 0.045398958993936526 Crosswise LP... (Crss-L...)
    From <0x530b..>To 0xb9b09264779733b8657b9b86970e3db74561c237 For 5,889.444163688823245113 Crosswise V1... (CRSS)
    From <0x530b..>To 0x2a479056fac97b62806cc740b11774e6598b1649 For 2.357428360536423062 Crosswise V1... (CRSS)
    From <0x530b..>To Null Address: 0x000...dEaD For 1.768071270402317296 Crosswise V1... (CRSS)
    From 0xb9b09264779733b8657b9b86970e3db74561c237To <0x530b..> For 5,893.238054445378305056 ($5,888.11) Binance-Peg ... (BUSD)
    From <0x530b..>To 0x99fefbc5ca74cc740395d65d384edd52cb3088bb For 1.768601850957604578 Crosswise V1... (CRSS)
    From 0x99fefbc5ca74cc740395d65d384edd52cb3088bbTo 0xb5d85ca38a9cbe63156a02650884d92a6e736ddc For 0.885184060482326627 Crosswise V1... (CRSS)
    From 0xb5d85ca38a9cbe63156a02650884d92a6e736ddcTo 0x8b6e0aa1e9363765ea106fa42fc665c691443b63 For 0.002372145209898758 ($1.05) Wrapped BNB (WBNB)
    From 0x99fefbc5ca74cc740395d65d384edd52cb3088bbTo 0xb5d85ca38a9cbe63156a02650884d92a6e736ddc For 0.883417790435536221 Crosswise V1... (CRSS)
    From 0x8b6e0aa1e9363765ea106fa42fc665c691443b63To 0xb5d85ca38a9cbe63156a02650884d92a6e736ddc For 0.002372145209898758 ($1.05) Wrapped BNB (WBNB)
    From Null Address: 0x000...000To 0x99fefbc5ca74cc740395d65d384edd52cb3088bb For 0.045398748436695767 Crosswise LP... (Crss-L...)
    From <0x530b..>To 0xb9b09264779733b8657b9b86970e3db74561c237 For 5,889.444163688823245113 Crosswise V1... (CRSS)
    From <0x530b..>To 0x2a479056fac97b62806cc740b11774e6598b1649 For 2.357428360536423062 Crosswise V1... (CRSS)
    From <0x530b..>To Null Address: 0x000...dEaD For 1.768071270402317296 Crosswise V1... (CRSS)
    From 0xb9b09264779733b8657b9b86970e3db74561c237To <0x530b..> For 5,413.500553138828613722 ($5,408.79) Binance-Peg ... (BUSD)
    From <0x530b..>To 0x99fefbc5ca74cc740395d65d384edd52cb3088bb For 1.768601850957604578 Crosswise V1... (CRSS)
    From 0x99fefbc5ca74cc740395d65d384edd52cb3088bbTo 0xb5d85ca38a9cbe63156a02650884d92a6e736ddc For 0.885184060502197492 Crosswise V1... (CRSS)
    From 0xb5d85ca38a9cbe63156a02650884d92a6e736ddcTo 0x8b6e0aa1e9363765ea106fa42fc665c691443b63 For 0.00237212322389177 ($1.05) Wrapped BNB (WBNB)
    From 0x99fefbc5ca74cc740395d65d384edd52cb3088bbTo 0xb5d85ca38a9cbe63156a02650884d92a6e736ddc For 0.883417790417384543 Crosswise V1... (CRSS)
    From 0x8b6e0aa1e9363765ea106fa42fc665c691443b63To 0xb5d85ca38a9cbe63156a02650884d92a6e736ddc For 0.00237212322389177 ($1.05) Wrapped BNB (WBNB)
    From Null Address: 0x000...000To 0x99fefbc5ca74cc740395d65d384edd52cb3088bb For 0.045398537838108977 Crosswise LP... (Crss-L...)
    From <0x530b..>To 0xb9b09264779733b8657b9b86970e3db74561c237 For 5,889.444163688823245113 Crosswise V1... (CRSS)
    From <0x530b..>To 0x2a479056fac97b62806cc740b11774e6598b1649 For 2.357428360536423062 Crosswise V1... (CRSS)
    From <0x530b..>To Null Address: 0x000...dEaD For 1.768071270402317296 Crosswise V1... (CRSS)
    From 0xb9b09264779733b8657b9b86970e3db74561c237To <0x530b..> For 4,990.067920822840857798 ($4,985.73) Binance-Peg ... (BUSD)
    From <0x530b..>To 0x99fefbc5ca74cc740395d65d384edd52cb3088bb For 1.768601850957604578 Crosswise V1... (CRSS)
    From 0x99fefbc5ca74cc740395d65d384edd52cb3088bbTo 0xb5d85ca38a9cbe63156a02650884d92a6e736ddc For 0.885184060521208763 Crosswise V1... (CRSS)
    From 0xb5d85ca38a9cbe63156a02650884d92a6e736ddcTo 0x8b6e0aa1e9363765ea106fa42fc665c691443b63 For 0.002372101238290026 ($1.05) Wrapped BNB (WBNB)
    From 0x99fefbc5ca74cc740395d65d384edd52cb3088bbTo 0xb5d85ca38a9cbe63156a02650884d92a6e736ddc For 0.883417790398375615 Crosswise V1... (CRSS)
    From 0x8b6e0aa1e9363765ea106fa42fc665c691443b63To 0xb5d85ca38a9cbe63156a02650884d92a6e736ddc For 0.002372101238290026 ($1.05) Wrapped BNB (WBNB)
    From Null Address: 0x000...000To 0x99fefbc5ca74cc740395d65d384edd52cb3088bb For 0.045398327242406948 Crosswise LP... (Crss-L...)
    From <0x530b..>To 0xb9b09264779733b8657b9b86970e3db74561c237 For 5,889.444163688823245113 Crosswise V1... (CRSS)
    From <0x530b..>To 0x2a479056fac97b62806cc740b11774e6598b1649 For 2.357428360536423062 Crosswise V1... (CRSS)
    From <0x530b..>To Null Address: 0x000...dEaD For 1.768071270402317296 Crosswise V1... (CRSS)
    From 0xb9b09264779733b8657b9b86970e3db74561c237To <0x530b..> For 4,614.459647890274411005 ($4,610.45) Binance-Peg ... (BUSD)
    From <0x530b..>To 0x99fefbc5ca74cc740395d65d384edd52cb3088bb For 1.768601850957604578 Crosswise V1... (CRSS)
    From 0x99fefbc5ca74cc740395d65d384edd52cb3088bbTo 0xb5d85ca38a9cbe63156a02650884d92a6e736ddc For 0.885184060540218863 Crosswise V1... (CRSS)
    From 0xb5d85ca38a9cbe63156a02650884d92a6e736ddcTo 0x8b6e0aa1e9363765ea106fa42fc665c691443b63 For 0.002372079253095816 ($1.05) Wrapped BNB (WBNB)
    From 0x99fefbc5ca74cc740395d65d384edd52cb3088bbTo 0xb5d85ca38a9cbe63156a02650884d92a6e736ddc For 0.883417790379366483 Crosswise V1... (CRSS)
    From 0x8b6e0aa1e9363765ea106fa42fc665c691443b63To 0xb5d85ca38a9cbe63156a02650884d92a6e736ddc For 0.002372079253095816 ($1.05) Wrapped BNB (WBNB)
    From Null Address: 0x000...000To 0x99fefbc5ca74cc740395d65d384edd52cb3088bb For 0.045398116649633658 Crosswise LP... (Crss-L...)
    From <0x530b..>To 0xb9b09264779733b8657b9b86970e3db74561c237 For 5,889.444163688823245113 Crosswise V1... (CRSS)
    From <0x530b..>To 0x2a479056fac97b62806cc740b11774e6598b1649 For 2.357428360536423062 Crosswise V1... (CRSS)
    From <0x530b..>To Null Address: 0x000...dEaD For 1.768071270402317296 Crosswise V1... (CRSS)
    From 0xb9b09264779733b8657b9b86970e3db74561c237To <0x530b..> For 4,279.734055232076284995 ($4,276.01) Binance-Peg ... (BUSD)
    From <0x530b..>To 0x99fefbc5ca74cc740395d65d384edd52cb3088bb For 1.768601850957604578 Crosswise V1... (CRSS)
    From 0x99fefbc5ca74cc740395d65d384edd52cb3088bbTo 0xb5d85ca38a9cbe63156a02650884d92a6e736ddc For 0.885184060559228479 Crosswise V1... (CRSS)
    From 0xb5d85ca38a9cbe63156a02650884d92a6e736ddcTo 0x8b6e0aa1e9363765ea106fa42fc665c691443b63 For 0.00237205726830913 ($1.05) Wrapped BNB (WBNB)
    From 0x99fefbc5ca74cc740395d65d384edd52cb3088bbTo 0xb5d85ca38a9cbe63156a02650884d92a6e736ddc For 0.883417790360357644 Crosswise V1... (CRSS)
    From 0x8b6e0aa1e9363765ea106fa42fc665c691443b63To 0xb5d85ca38a9cbe63156a02650884d92a6e736ddc For 0.00237205726830913 ($1.05) Wrapped BNB (WBNB)
    From Null Address: 0x000...000To 0x99fefbc5ca74cc740395d65d384edd52cb3088bb For 0.045397906059789063 Crosswise LP... (Crss-L...)
    From <0x530b..>To 0xb9b09264779733b8657b9b86970e3db74561c237 For 5,889.444163688823245113 Crosswise V1... (CRSS)
    From <0x530b..>To 0x2a479056fac97b62806cc740b11774e6598b1649 For 2.357428360536423062 Crosswise V1... (CRSS)
    From <0x530b..>To Null Address: 0x000...dEaD For 1.768071270402317296 Crosswise V1... (CRSS)
    From 0xb9b09264779733b8657b9b86970e3db74561c237To <0x530b..> For 3,980.164937420819060374 ($3,976.70) Binance-Peg ... (BUSD)
    From <0x530b..>To 0x99fefbc5ca74cc740395d65d384edd52cb3088bb For 1.768601850957604578 Crosswise V1... (CRSS)
    From 0x99fefbc5ca74cc740395d65d384edd52cb3088bbTo 0xb5d85ca38a9cbe63156a02650884d92a6e736ddc For 0.885184060578237707 Crosswise V1... (CRSS)
    From 0xb5d85ca38a9cbe63156a02650884d92a6e736ddcTo 0x8b6e0aa1e9363765ea106fa42fc665c691443b63 For 0.002372035283929956 ($1.05) Wrapped BNB (WBNB)
    From 0x99fefbc5ca74cc740395d65d384edd52cb3088bbTo 0xb5d85ca38a9cbe63156a02650884d92a6e736ddc For 0.883417790341348847 Crosswise V1... (CRSS)
    From 0x8b6e0aa1e9363765ea106fa42fc665c691443b63To 0xb5d85ca38a9cbe63156a02650884d92a6e736ddc For 0.002372035283929956 ($1.05) Wrapped BNB (WBNB)
    From Null Address: 0x000...000To 0x99fefbc5ca74cc740395d65d384edd52cb3088bb For 0.045397695472873083 Crosswise LP... (Crss-L...)
    From <0x530b..>To 0xb9b09264779733b8657b9b86970e3db74561c237 For 5,889.444163688823245113 Crosswise V1... (CRSS)
    From <0x530b..>To 0x2a479056fac97b62806cc740b11774e6598b1649 For 2.357428360536423062 Crosswise V1... (CRSS)
    From <0x530b..>To Null Address: 0x000...dEaD For 1.768071270402317296 Crosswise V1... (CRSS)
    From 0xb9b09264779733b8657b9b86970e3db74561c237To <0x530b..> For 3,710.994798401068128709 ($3,707.77) Binance-Peg ... (BUSD)
    From <0x530b..>To 0x99fefbc5ca74cc740395d65d384edd52cb3088bb For 1.768601850957604578 Crosswise V1... (CRSS)
    From 0x99fefbc5ca74cc740395d65d384edd52cb3088bbTo 0xb5d85ca38a9cbe63156a02650884d92a6e736ddc For 0.885184060597246719 Crosswise V1... (CRSS)
    From 0xb5d85ca38a9cbe63156a02650884d92a6e736ddcTo 0x8b6e0aa1e9363765ea106fa42fc665c691443b63 For 0.002372013299958284 ($1.05) Wrapped BNB (WBNB)
    From 0x99fefbc5ca74cc740395d65d384edd52cb3088bbTo 0xb5d85ca38a9cbe63156a02650884d92a6e736ddc For 0.883417790322340588 Crosswise V1... (CRSS)
    From 0x8b6e0aa1e9363765ea106fa42fc665c691443b63To 0xb5d85ca38a9cbe63156a02650884d92a6e736ddc For 0.002372013299958284 ($1.05) Wrapped BNB (WBNB)
    From Null Address: 0x000...000To 0x99fefbc5ca74cc740395d65d384edd52cb3088bb For 0.045397484888885675 Crosswise LP... (Crss-L...)
    From <0x530b..>To 0xb9b09264779733b8657b9b86970e3db74561c237 For 5,889.444163688823245113 Crosswise V1... (CRSS)
    From <0x530b..>To 0x2a479056fac97b62806cc740b11774e6598b1649 For 2.357428360536423062 Crosswise V1... (CRSS)
    From <0x530b..>To Null Address: 0x000...dEaD For 1.768071270402317296 Crosswise V1... (CRSS)
    From 0xb9b09264779733b8657b9b86970e3db74561c237To <0x530b..> For 3,468.244623821229973105 ($3,465.23) Binance-Peg ... (BUSD)
    From <0x530b..>To 0x99fefbc5ca74cc740395d65d384edd52cb3088bb For 1.768601850957604578 Crosswise V1... (CRSS)
    From 0x99fefbc5ca74cc740395d65d384edd52cb3088bbTo 0xb5d85ca38a9cbe63156a02650884d92a6e736ddc For 0.885184060616255354 Crosswise V1... (CRSS)
    From 0xb5d85ca38a9cbe63156a02650884d92a6e736ddcTo 0x8b6e0aa1e9363765ea106fa42fc665c691443b63 For 0.002371991316394102 ($1.05) Wrapped BNB (WBNB)
    From 0x99fefbc5ca74cc740395d65d384edd52cb3088bbTo 0xb5d85ca38a9cbe63156a02650884d92a6e736ddc For 0.883417790303332618 Crosswise V1... (CRSS)
    From 0x8b6e0aa1e9363765ea106fa42fc665c691443b63To 0xb5d85ca38a9cbe63156a02650884d92a6e736ddc For 0.002371991316394102 ($1.05) Wrapped BNB (WBNB)
    From Null Address: 0x000...000To 0x99fefbc5ca74cc740395d65d384edd52cb3088bb For 0.045397274307826759 Crosswise LP... (Crss-L...)
    From <0x530b..>To 0xb9b09264779733b8657b9b86970e3db74561c237 For 5,889.444163688823245113 Crosswise V1... (CRSS)
    From <0x530b..>To 0x2a479056fac97b62806cc740b11774e6598b1649 For 2.357428360536423062 Crosswise V1... (CRSS)
    From <0x530b..>To Null Address: 0x000...dEaD For 1.768071270402317296 Crosswise V1... (CRSS)
    From 0xb9b09264779733b8657b9b86970e3db74561c237To <0x530b..> For 3,248.565855119485359289 ($3,245.74) Binance-Peg ... (BUSD)
    From <0x530b..>To 0x99fefbc5ca74cc740395d65d384edd52cb3088bb For 1.768601850957604578 Crosswise V1... (CRSS)
    From 0x99fefbc5ca74cc740395d65d384edd52cb3088bbTo 0xb5d85ca38a9cbe63156a02650884d92a6e736ddc For 0.885184060635263657 Crosswise V1... (CRSS)
    From 0xb5d85ca38a9cbe63156a02650884d92a6e736ddcTo 0x8b6e0aa1e9363765ea106fa42fc665c691443b63 For 0.0023719693332374 ($1.05) Wrapped BNB (WBNB)
    From 0x99fefbc5ca74cc740395d65d384edd52cb3088bbTo 0xb5d85ca38a9cbe63156a02650884d92a6e736ddc For 0.883417790284325433 Crosswise V1... (CRSS)
    From 0x8b6e0aa1e9363765ea106fa42fc665c691443b63To 0xb5d85ca38a9cbe63156a02650884d92a6e736ddc For 0.0023719693332374 ($1.05) Wrapped BNB (WBNB)
    From Null Address: 0x000...000To 0x99fefbc5ca74cc740395d65d384edd52cb3088bb For 0.045397063729696293 Crosswise LP... (Crss-L...)
    From <0x530b..>To 0xb9b09264779733b8657b9b86970e3db74561c237 For 5,889.444163688823245113 Crosswise V1... (CRSS)
    From <0x530b..>To 0x2a479056fac97b62806cc740b11774e6598b1649 For 2.357428360536423062 Crosswise V1... (CRSS)
    From <0x530b..>To Null Address: 0x000...dEaD For 1.768071270402317296 Crosswise V1... (CRSS)
    From 0xb9b09264779733b8657b9b86970e3db74561c237To <0x530b..> For 3,049.124193886389810521 ($3,046.47) Binance-Peg ... (BUSD)
    From <0x530b..>To 0x58f876857a02d6762e0101bb5c46a8c1ed44dc16 For 56,153.782833091550345322 ($56,104.93) Binance-Peg ... (BUSD)



    Contract 0x2Eac885d1d3D28B82bE2727d6178031eF5CAc742 created, 24 min after the attack, by 0x1dd60Ba11Ed9153ace275F020BdB1170223d6d39, which has 


    0_1 <0x530b..> -> Router, 0.01 BNB
        0_1_1 Router ->  WBNB, 0.01 BNB
    0_1 <0x530b..> -> 0xccddce9f0e241a5ea0e76465c59e9f0c41727003 (Not created) 0 BNB

    ------------ transfer/transferFrom -> SwapAndLiquify
                    0_1_1_1_1_1 WBNB -> Router, 0.00236987147103197 BNB -------------- RemoveLiquidity/SwapTokenForETH
                0_1_1_1_1 Router -> CRSSv1.1, 0.00236987147103197 BNB

            0_1_1_1 CRSSv1.1 -> Router, 0.00236987147103197 BNB --------------- AddLiquidity/SwapTEHForToken
                0_1_1_1_1 Router -> WBNB, 0.00236987147103197 BNB *relay the same amount*

    ------------ transfer/transferFrom -> SwapAndLiquify
                    0_1_1_1_1_1	WBNB -> Router, 0.00237218685429152 BNB  *send back **more** than it received* -------------- RemoveLiquidity/SwapTokenForETH
                0_1_1_1_1 Router -> CRSSv1.1, 0.00237218685429152 BNB *relay the same amount*

            0_1_1_1 CRSSv1.1 -> Router, 0.00237218685429152 BNB *send back the same amount* --------------- AddLiquidity/SwapTEHForToken
                0_1_1_1_1 Router -> WBNB, 0.00237218685429152 BNB *relay the same amount*

    ------------ transfer/transferFrom -> SwapAndLiquify
                    0_1_1_1_1_1 WBNB -> Router, 0.002372167193999869 BNB *send back **less** than it received*  -------------- RemoveLiquidity/SwapTokenForETH
                0_1_1_1_1 Router -> CRSSv1.1, 0.002372167193999869 BNB

            0_1_1_1 CRSv1.1 -> Router, 0.002372167193999869 BNB   --------------- AddLiquidity/SwapTEHForToken
                0_1_1_1_1 Router -> WBNB, 0.002372167193999869 BNB

    ------------ transfer/transferFrom -> SwapAndLiquify
                    0_1_1_1_1_1 WBNB -> Router, 0.002372145209898758 BNB **less**  -------------- RemoveLiquidity/SwapTokenForETH
                0_1_1_1_1 Router -> CRSSv1.1, 0.002372145209898758 BNB

            0_1_1_1 CRSv1.1 -> Router, 0.002372145209898758 BNB --------------- AddLiquidity/SwapTEHForToken
                0_1_1_1_1 Router -> WBNB, 0.002372145209898758 BNB

    ------------ transfer/transferFrom -> SwapAndLiquify
                    0_1_1_1_1_1 WBNB -> Router, 0.00237212322389177 BNB **less**  -------------- RemoveLiquidity/SwapTokenForETH
                0_1_1_1_1 Router -> CRSSv1.1, 0.00237212322389177 BNB

            0_1_1_1 CRSv1.1 -> Router, 0.00237212322389177 BNB --------------- AddLiquidity/SwapTEHForToken
                0_1_1_1_1 Router -> WBNB, 0.00237212322389177 BNB

    ------------ transfer/transferFrom -> SwapAndLiquify
                    0_1_1_1_1_1 WBNB -> Router, 0.002372101238290026 BNB **less**  -------------- RemoveLiquidity/SwapTokenForETH
                0_1_1_1_1 Router -> CRSSv1.1, 0.002372101238290026 BNB

            0_1_1_1 CRSv1.1 -> Router, 0.002372101238290026 BNB --------------- AddLiquidity/SwapTEHForToken
                0_1_1_1_1 Router -> WBNB, 0.002372101238290026 BNB

    ------------ transfer/transferFrom -> SwapAndLiquify
                    0_1_1_1_1_1 WBNB -> Router, 0.002372079253095816 BNB **less**  -------------- RemoveLiquidity/SwapTokenForETH
                0_1_1_1_1 Router -> CRSSv1.1, 0.002372079253095816 BNB

            0_1_1_1 CRSv1.1 -> Router, 0.002372079253095816 BNB --------------- AddLiquidity/SwapTEHForToken
                0_1_1_1_1 Router -> WBNB, 0.002372079253095816 BNB

     ------------ transfer/transferFrom -> SwapAndLiquify
                    0_1_1_1_1_1 WBNB -> Router, 0.00237205726830913 BNB **less**  -------------- RemoveLiquidity/SwapTokenForETH
                0_1_1_1_1 Router -> CRSSv1.1, 0.00237205726830913 BNB

            0_1_1_1 CRSv1.1 -> Router, 0.00237205726830913 BNB --------------- AddLiquidity/SwapTEHForToken
                0_1_1_1_1 Router -> WBNB, 0.00237205726830913 BNB

    ------------ transfer/transferFrom -> SwapAndLiquify
                    0_1_1_1_1_1 WBNB -> Router, 0.002372035283929956 BNB **less**  -------------- RemoveLiquidity/SwapTokenForETH
                0_1_1_1_1 Router -> CRSSv1.1, 0.002372035283929956 BNB

            0_1_1_1 CRSv1.1 -> Router, 0.002372035283929956 BNB --------------- AddLiquidity/SwapTEHForToken
                0_1_1_1_1 Router -> WBNB, 0.002372035283929956 BNB

    ------------ transfer/transferFrom -> SwapAndLiquify
                    0_1_1_1_1_1 WBNB -> Router, 0.002372013299958284 BNB **less**  -------------- RemoveLiquidity/SwapTokenForETH
                0_1_1_1_1 Router -> CRSSv1.1, 0.002372013299958284 BNB

            0_1_1_1 CRSv1.1 -> Router, 0.002372013299958284 BNB --------------- AddLiquidity/SwapTEHForToken
                0_1_1_1_1 Router -> WBNB, 0.002372013299958284 BNB

    ------------ transfer/transferFrom -> SwapAndLiquify
                    0_1_1_1_1_1 WBNB -> Router, 0.002371991316394102 BNB **less**  -------------- RemoveLiquidity/SwapTokenForETH
                0_1_1_1_1 Router -> CRSSv1.1, 0.002371991316394102 BNB

            0_1_1_1 CRSv1.1 -> Router, 0.002371991316394102 BNB --------------- AddLiquidity/SwapTEHForToken
                0_1_1_1_1 Router -> WBNB, 0.002371991316394102 BNB

    ------------ transfer/transferFrom -> SwapAndLiquify
                    0_1_1_1_1_1 WBNB -> Router, 0.0023719693332374 BNB **less**  -------------- RemoveLiquidity/SwapTokenForETH
                0_1_1_1_1 Router -> CRSSv1.1, 0.0023719693332374 BNB

            0_1_1_1 CRSv1.1 -> Router, 0.0023719693332374 BNB --------------- AddLiquidity/SwapTEHForToken
                0_1_1_1_1 Router -> WBNB, 0.0023719693332374 BNB



            **0_1_1_1 WBNB ->  0x10ed43c718714eb63d5aa57b78b54704e256024e, 119.150453562480096914 BNB**  -------------- RemoveLiquidity/SwapTokenForETH from <0x530b..>?
        **0_1_1 0x10ed43c718714eb63d5aa57b78b54704e256024e, <0x530b..>, 119.150453562480096914 BNB**
    **0_1 <0x530b..>, 0x748346113b6d61870aa0961c6d3fb38742fc5089, 119.150453562480096914 BNB**



0.0023719693332374 BNB = $1.114825586621578 (Jan 18) = 0.5 x 0.03% x  $7,432
$7,400 x 12 = $88,800
119 BNB x 470$ = $56,000



## Tx Receipt Event Logs https://bscscan.com/tx/0xd02e444d0ef7ff063e3c2cecceba67eae832acf3f9cf817733af9139145f479b#eventlog



0x70873211cb64c1d4ec027ea63a399a7d07c4085b
SetTrustedForwarder
_trustedForwarder : 0x530b338261f8686e49403d1b5264e7a1e169f06b

0x70873211cb64c1d4ec027ea63a399a7d07c4085b
OwnershipTransferred: 0x2a479056fac97b62806cc740b11774e6598b1649, 0x530b338261f8686e49403d1b5264e7a1e169f06b

0x70873211cb64c1d4ec027ea63a399a7d07c4085b
SetTrustedForwarder
_trustedForwarder : 0x000000000000000000000000000000000000dead

0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c
Deposit: 