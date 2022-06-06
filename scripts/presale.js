const fs = require("fs")
// const ethers = require("ethers")
const {abi: presale_abi} = require("../artifacts/contracts/PreSale1.sol/Presale.json")
const {abi: presale2_abi} = require("../artifacts/contracts/Presale2.sol/PresaleV2.json")

const presale1 = "0xAd3f5A4526fbEd82A865d1BaeF14153488f86487"
const presale2 = "0x3DC2b7E5dc5274C2d603342E73D1d0A9DE96796A"

const getPresaleInfo = async (address, abi, round) => {
    [theOwner] = await ethers.getSigners();
    presale = new ethers.Contract(address,  abi, theOwner);
    const users = await presale.allInvestors()
    console.log(`Preale ${round} Users: `, users.length)

    // for(let i = 0; i < users.length; i++) {
    for(let i = 0; i < 3; i++) {
        const userInfo = await presale.userDetail(users[i])
        const user = {}
        user.address = users[i]
        user.depositTime = Number(userInfo.depositTime)
        user.total = ethers.utils.formatEther(userInfo.totalRewardAmount)
        user.withdrawAmount = ethers.utils.formatEther(userInfo.withdrawAmount)
        user.depositAmount = ethers.utils.formatEther(userInfo.depositAmount)
        console.log(i, user)
        fs.appendFileSync(`_snapshot/presale${round}.json`, JSON.stringify(user) + ",")
    }
}

const main = async () => {
    await getPresaleInfo(presale1, presale_abi, 1)
    await getPresaleInfo(presale2, presale2_abi, 2)
}

main()