// SPDX-License-Identifier: MIT
pragma solidity 0.7.4;

import "hardhat/console.sol";

contract TrustedForwarder{

    bool public state;
    bytes public retData;

    function execute(
        address to,
        address from,
        bytes memory data
    )
    payable
    external 
    returns (bool success, bytes memory ret) {
        /* solhint-disable-next-line avoid-low-level-calls */
        (success,ret) = to.call{value: msg.value}(abi.encodePacked(data, from));
        state = success;
        retData = ret;
    }
}