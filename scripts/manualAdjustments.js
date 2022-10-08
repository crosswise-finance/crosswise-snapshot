exports.addressesToChange = [
    //addresses of users who claimed their wallet was hacked, and providied proof of address ownership
    { "oldAddress": "0x8aC458588444e4018ddB58b7F3080496F7986947", "newAddress": "0x926C3b1271d07594B11C8FB28C99683801736300" },
    { "oldAddress": "0x6d7ED0DA2ACaa2a047630Ea1741537b6f2181806", "newAddress": "0x91E321BEddA63F8E04235a417828cB075B23b111" },
    { "oldAddress": "0x60a69d2f9327543f7916f3974479F02EE561873E", "newAddress": "0xBAa9B7B74DF9d446198d2e3C08f71Ad34539fC4D" },
    { "oldAddress": "0x3355e761f7b3ba2c08aE0CE7b6C821122040ef0A", "newAddress": "0x30a9BdF6c028242a26F99270168217E8a2B1145F" },
    { "oldAddress": "0xd6b09f1d6b1f35c2ff09651c221663bce4993204", "newAddress": "0x6740353b66F823C9d30AE96fc32566C3160804A3" },
    { "oldAddress": "0xeBA0DB97eC85ef23049Af7E1270D7240DF4Bb59f", "newAddress": "0xa622216e4Cf0f7A59c93c18B82bB5011ed5B9F51" },
    { "oldAddress": "0xB8CE3fC4D0a60e9e28973D42435daC211b273b87", "newAddress": "0x25747761965f2710FdA9851636F722268925c1A0" },
    { "oldAddress": "0x9FF251fD3363632626E96CE5ccC82CEe6C80A732", "newAddress": "0xe3fdc3fee7ea3c05aaba89c7d65b5351da400164" },
    { "oldAddress": "0x975ab1f920059615dDbF3d08fa68962e10926295", "newAddress": "0xbb3940aB8cf809f8cdc24080b838B95622eA9c89" },
    { "oldAddress": "0x84d9dbd0fb282f3884bb663fe4febbceb046440b", "newAddress": "0xc5DD37bcfb33a3Cc03b909038400E5Bf5CbbeFFB" },
    { "oldAddress": "0xD3137741763cc0eeAD8cf7b3BCF9e895B61BfB51", "newAddress": "0xF3DC05E6E11E37530d4612182EFB397e491bD8B1" }

]
//address of former business partner 
exports.specialCaseAddress = { "oldAddress": "0x2C61569026CA8DA02911fd991d2FF695C435D031".toLowerCase(), "newAddress": "0xc1Aaf375DdDdE66Fa45794B63260A2E7a8BdeAbA".toLowerCase() }
//addresses that tried converting to new version of CRSS when max supply was reached, losing tokens in the process
exports.failedConversionAdjustments = [{ "oldAddress": "0x4D473bC97aDF3B6bd48F28a80a495964Bd67e13b".toLowerCase(), "crssOwed": 105 },
{ "oldAddress": "0x7BE73921626702D045B69E47bA029572b5d0f768".toLowerCase(), "crssOwed": 948.518 }]