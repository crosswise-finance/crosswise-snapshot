const hre = require("hardhat");
const { ethers } = require("hardhat")
const fs = require("fs");
const abi_crss = require("../_supporting/abi_crss.json");
const abi_lp = require("../_supporting/abi_crosswise_pair.json");
const abi_xcrss = require("../_supporting/abi_xcrss.json");

/**
 * Function for Getting Transfer Event History
 * @param {*Token Name to be used for path} tokenName 
 * @param {*Token Address that is deployed on BSC Mainnet} tokenAddress 
 * @param {*Token Abi - CrssAbi in the case of Cross Token and Pair Abi for LP tokens} abi 
 * @param {*Owner Address for calling contracts} owner 
 */
async function getTransferHistory(tokenName, tokenAddress, abi, owner) {
	const token = new ethers.Contract(tokenAddress, abi, owner);
	const decimal = await token.decimals();
	let total = await token.totalSupply();

	// Path to save transfer history
	const path = `./events/${tokenName}.json`;
	// Path to save transfer history event counts - Temporary data
	const countPath = `./events/${tokenName}_counts.txt`;

	console.log(`${tokenName}.Decimals: ${decimal}, TotalSupply: ${total}`.yellow);
	fs.writeFileSync(countPath, `${tokenName}.Decimals: ${decimal}, TotalSupply: ${total}\n`, 'utf-8');

	// Create Transfer Filter
	let transferFilter = token.filters.Transfer(null, null);
	let transferEvents;

	// Track from 14270000 to 14680000 (Jan 11 - Jan 25)
	let bn_prev = 14614000, bn_end = 14680000, delta = 1000;
	// let bn_prev = 14270000, bn_end = 14680000, delta = 1000;
	let totalEvents = 0;

	const start = new Date();

	/**
	 * Loop through all blocks and get transfer events
	 */
	for (bn = bn_prev + delta - 1; bn <= bn_end; bn += delta) {
		transferEvents = await token.queryFilter(transferFilter, bn_prev, bn); // 13280670, 14671200
		console.log("\t------------------[%s, %s]: %s", bn_prev, bn, transferEvents.length);

		bn_prev = bn + 1;
		if (transferEvents.length === 0) continue;
		totalEvents += transferEvents.length;

		// Stringify transferevents data
		const stringData = JSON.stringify(transferEvents);

		// Slice [] from the start and end of array string for appending to previous data
		const dataToSave = `${stringData.slice(1, stringData.length - 1)}`

		// Save transfer history
		if (fs.existsSync(path)) {
			fs.appendFileSync(path, `,${dataToSave}`, 'utf-8');
		} else {
			fs.writeFileSync(path, `[${dataToSave}`, 'utf-8');
		}

		// Save Count log
		const countLog = `From ${bn_prev}, To ${bn}, Counts: ${transferEvents.length}\n`
		fs.appendFileSync(countPath, countLog, 'utf-8');
	}

	fs.appendFileSync(path, `]`, 'utf-8');
	fs.appendFileSync(countPath, `Total: ${totalEvents}\nElapsed: ${new Date() - start}`, 'utf-8');
}

async function main() {

	const [theOwner] = await ethers.getSigners();

	// The list of tokens to get transfer history
	const tokenList = [
		'CRSSV11',
		'XCRSS',
		'CRSS_USDC',
		'CRSS_BNB',
		'CRSS_BUSD',
		'BNB_BUSD',
		'USDT_BUSD',
		'BNB_ETH',
		'BNB_BTCB',
		'BNB_CAKE',
		'BNB_ADA',
		'BNB_DOT',
		'BNB_LINK'
	];
	/**
	 * Loop through Token List 
	 */
	for (let i = 0; i < tokenList.length; i++) {
		if (i === 0)
			await getTransferHistory(tokenList[0], process.env[tokenList[0]], abi_crss, theOwner);
		else if (i === 1)
			await getTransferHistory(tokenList[1], process.env[tokenList[1]], abi_xcrss, theOwner);
		else
			await getTransferHistory(tokenList[i], process.env[tokenList[i]], abi_lp, theOwner);
	}
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
