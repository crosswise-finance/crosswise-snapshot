
var DECIMALS;

function weiToEthEn(wei) { return Number(ethers.utils.formatUnits(wei.toString(), DECIMALS)).toLocaleString('en') };
function weiToEth(wei) { return Number(ethers.utils.formatUnits(wei.toString(), DECIMALS)) };
function ethToWei(eth) { return ethers.utils.parseUnits(eth.toString(), DECIMALS); };
function uiAddr(address) { return "{0x" + address.substring(2, 6).concat('...') + "}" ; };
async function myExpectRevert(promise, revert_string) { 
	await promise.then(()=>expect(true).to.equal(false))
	.catch((err)=>{
		if( ! err.toString().includes(revert_string) )	{
			expect(true).to.equal(false);
		}
	})
};
function findEvent(receipt, eventName, args) {
	var event;
	for(let i = 0; i < receipt.events.length; i++) {
		if(receipt.events[i].event == eventName) {
			event = receipt.events[i];
			break;
		}
	}
	let matching;
	if(event != undefined) {
		matching = true;
		for(let i = 0; i < Object.keys(args).length; i++) {
			let arg = Object.keys(args)[i];
			if(event.args[arg] != undefined && parseInt(event.args[arg]) != parseInt(args[arg])) {
				matching = false;
				break;
			} else if( event.args[0][arg] != undefined && parseInt(event.args[0][arg]) != parseInt(args[arg]) ) {
				matching = false;
				break;
			}
		}
	} else {
		matching = false;
	}
	return matching;
};
function retrieveEvent(receipt, eventName) {
	var event;
	for(let i = 0; i < receipt.events.length; i++) {
		if(receipt.events[i].event == eventName) {
			event = receipt.events[i];
			break;
		}
	}
	var args;
	if(event != undefined) {
		if(Array.isArray(event.args)) {
			if(Array.isArray(event.args[0])) {
				args = event.args[0];
			} else {
				args = event.args;
			}
		} else {
			args = event.args;
		}
	}
	return args;
};

exports.DECIMALS = DECIMALS;
exports.weiToEthEn = weiToEthEn;
exports.weiToEth = weiToEth;
exports.ethToWei = ethToWei;
exports.uiAddr = uiAddr;
exports.myExpectRevert = myExpectRevert;
exports.findEvent = findEvent;
exports.retrieveEvent = retrieveEvent;

