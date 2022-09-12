pragma solidity >=0.5.0;

import "hardhat/console.sol";
contract BaseRelayRecipient {

    /*
     * Forwarder singleton we accept calls from
     */
    address public trustedForwarder = 0xa513E6E4b8f2a923D98304ec87F64353C4D5C853;

    /*
     * require a function to be called through GSN only
     */
    modifier trustedForwarderOnly() {
        require(__msgSender() == address(trustedForwarder), "Function can only be called through the trusted Forwarder");
        _;
    }

    function isTrustedForwarder(address forwarder) public view returns(bool) {
        return forwarder == trustedForwarder;
    }

    /**
     * return the sender of this call.
     * if the call came through our trusted forwarder, return the original sender.
     * otherwise, return `__msgSender()`.
     * should be used in the contract anywhere instead of __msgSender()
     */
    function __msgSender() internal view returns (address ret) {
        if (isTrustedForwarder(msg.sender)) {
            // At this point we know that the sender is a trusted forwarder,
            // so we trust that the last bytes of msg.data are the verified sender address.
            // extract sender address from the end of msg.data
            assembly {
                ret := shr(96, calldataload(sub(calldatasize(), 20)))
            }
        } else {
            return msg.sender;
        }
    }
}