const fs = require("fs")
const { presale1, presale2 } = require("./constants")
const { abi: presale_abi } = require("../artifacts/contracts/PreSale1.sol/Presale.json")
const { abi: presale2_abi } = require("../artifacts/contracts/Presale2.sol/PresaleV2.json")

const getPresaleInfo = async (address, abi, round) => {
    [theOwner] = await ethers.getSigners();
    presale = new ethers.Contract(address, abi, theOwner);
    const users = await presale.allInvestors()
    console.log(`Preale ${round} Users: `, users.length)

    for (let i = 0; i < users.length; i++) {
        const userInfo = await presale.userDetail(users[i])
        const user = {}
        user.address = users[i]
        user.depositTime = Number(userInfo.depositTime)
        user.total = ethers.utils.formatEther(userInfo.totalRewardAmount)
        user.withdrawAmount = ethers.utils.formatEther(userInfo.withdrawAmount)
        user.depositAmount = ethers.utils.formatEther(userInfo.depositAmount)
        console.log(i, user)
        fs.appendFileSync(`_snapshot/presale/presale${round}.json`, JSON.stringify(user) + ",")
    }
}

const main = async () => {
    await getPresaleInfo(presale1, presale_abi, 1)
    await getPresaleInfo(presale2, presale2_abi, 2)
}

main()