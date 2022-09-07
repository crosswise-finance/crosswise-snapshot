CRSS PROTOCOL COMPENSATION
 
 
The compensation is split into 4 structural parts, based on location of user's entitled value

-This is how to use javascripts inside the repo to obtain all parts of the compensation,except for dip buyers/sellers (handled externally)
-Run the scripts in described order 
* MUST FIRST RUN 1.PRESALE COMPENSATION and then 5.B) GET ALL HOLDER ADDRESSES (if you want to generate your own address list instead of using the address list provided in the repo)
* Order of other functions after those 2 above is irrelevant
* You may need to create folders and json files manually for some of the scripts for data to get saved
 
 1. PRESALE COMPENSATION
- requires installing web3 
- this is the most simple script as it simply reads from the blockchain (web3 is used here to perform this task, install with npm install web3 )
- once you got ABIs, addresses and web3 you can run the script, output will be 4json files, 2 object arrays containing all presale holders and their entitlement and 2 objects with global values for each presale contract


2. USER WALLET COMPENSATION
* requires BSC Pro Api for request "Get Historical BEP-20 Token Account Balance by ContractAddress & BlockNo"
* requires full address list (_snapshot/fullAddressList.json)

- this one requires installing the following plugins: dotenv, fs and an API plugin for sending requests to BSC Pro Api service(we used axios for the compensation)
- in addition to the fullAddressList we are also fetching all token addresses and prices (used to automatically convert between different assets to CRSS) from the constants.js file
- run the main function once for each relevant timestamp (takes above 4h for each timestamp, since it has to fetch 12 requests per user for 2398 addresses, and this BSC Api call is limited to 2/s)
- run the global function 



3. MASTERCHEF STAKING COMPENSATION

- requires installing following plugins: dotenv, fs and web3
- run getMasterchefWeb3Data
- run getMasterchefGlobalData  

4. DIP BUYERS
* after more than 4 different developers spending months on trying to get data by gathering, organising and calculating values for each address through event logs and address BEP20 token transfers, we relised the current architecture of the protocol at that time makes it impossible for us to proceed with this method
* the core of the issues are the following:  A) passage of funds through multiple contracts for each swap, making tracking of those funds next to impossible
                                             B) scope for all dip buys and sells contained multiple different DEX protocols as well as 12 different tokens
                                             C) it is not neccesary to use the router contract when swapping, so minority of users were also swapping with the pairs directly which changes the way the transaction is recorded
                                             D) some tranfers included not only more then 2 pairs (for example trading from LINK to CRSS and CRSS to WBTC to swap LINK to WBTC directly when there is no such pair) but also multiple dexes (for example LINK to CRSS on cross exchange and then CRSS to WBTC on pancakeswap)
* the issue will be mitigated by retreiving buyer and seller amounts in BUSD for the timeframe in scope externally, details revealed when the compensation protocol is live

5. EXTRA

A) GET HISTORICAL SUPPLY VALUES
* requires BSC Pro Api
- requires : dotenv, fs and axios (or other API request service)
- this will get you historical supply levels of CRSS token, using BSC "Get Historical BEP-20 Token TotalSupply by ContractAddress & BlockNo " request

B) GET ALL HOLDER ADDRESSES
* this provides the fullAddressList.json required in compensation parts 2. and 3. 
* has to be run after presale compensation
* draws from presale json files and Sum_balance_current.json in addition to fetching all current token holders of the 12 within scope to combine this into the full list of 2398 addresses, with no duplicates