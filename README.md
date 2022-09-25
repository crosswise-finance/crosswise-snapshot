Instruction manual for recreating Crosswise protocol's user compensation
-----------------------------------
------------------
------

Following dependencies need to be installed to run all the scripts
1. We recommend installing Git, to clone this repository easily
2. You need a code editor to read all the files and run the scripts, we recommend VSCode, this is what we used

3. In addition to NPM, you need something to run JS scripts,  you can use Node with "node scripts/getPresaleCompensation.js",you can use hardhat with "npx hardhat run scripts/getPresaleCompensation.js",or any other tool you prefer
----------------------------------
https://nodejs.org/en/ - includes NPM

https://www.npmjs.com/package/hardhat - if you want to use hardhat

4. Following dependencies were used in the code : 
- FS - install with "npm install fs" in VSCode terminal 
- Web3 - install with "npm install web3"
- also install "npm install web3-eth-contract"
- Axios (or some other HTTP client for sending API requests if you can make the necessary adjustments in the code) - install with "npm install axios"
- dotenv - install with "npm install dotenv"
- inside .env file add your own API keys to BSC_PUBLIC_API and MORALIS_API (and, if you want to run getBalanceHistory.js you also need to add BSC_PREMIUM_API), you can use    the       ".env.example" file as reference for setting up dotenv API keys

* All the other dependencies will be written into this Github repo, for those who don't want to wait 4h+ or don't have BSC Pro API, we included historic wallet balances for block before the attack so you don't have to run getBalanceHistory.js 
-----------------------------------
The scripts must be run in the correct order, as some scripts rely on other scripts to execute
* First extract this repository's data somewhere, easiest way is to type "git clone https://github.com/crosswise-finance/crosswise-snapshot" in VSCode terminal 

1. Run getPresaleCompensation.js => this will output two different lists for each of the two deployed presale contracts, containing CRSS owed amounts for each user
2. Run reconstructStaking.js => this will output all token amount and total crss entitlement for each user
- this is the only thing you need to do to get staking and farming CRSS and LP token amounts, if you want you can also run getSmartContractCompensation.js and getMasterchefAdjustment.js to get only CRSS staking, this was the old approach that didn't include LP tokens in farms, we left it in as it serves as a test script for validity of values derived in reconstruction
-takes
* only for testing or deriving CRSS staking exclusively, Run getSmartContractCompensation.js => this will output a list of all eligible staked CRSS for each user
- After this you need to run getMasterchefAdjustment.js to get totalAdjustedStaking.json, which includes stakingAttackers.js
- getSmartContractCompensation takes about 3-4mins, MC adjustment takes about 5-6mins

3. optional, Run getAllHolderAddresses.js, if you want to generate your own list, you can also skip this step and use the address list we provided in the Repo as "FullAddressList.json"

4. optional, Run getBalanceHistory.js, for this you need BSC Pro API, takes 4h+ per timestamp, if you want to skip this part, the output json file you would get if you ran the script will be provided in the Repo as "totalAmountsBefore.json"

5. Run getDipBuyersAndSellers.js => this will combine and calculate gathered buyers and sellers data and output total amounts of CRSS to be added or deducted from each user

6. Run getCompensation.js => this will output compensationV1.json, and include manualAdjustments.js

- there are some additional scripts we used, like script for getting LP token prices for block before exploit, but these 6 scripts are the only ones needed to get the full compensation values

* Note
-These are preliminary results, and the scripts are not necessarily final. We will allow  the community time to report any divergences from expected entitlements. The system and calculations are very robust, but there is scope for errors.