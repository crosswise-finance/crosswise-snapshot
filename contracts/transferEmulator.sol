//SPDX-License-Identifier: UNLICENSED
pragma solidity 0.6.12;

import "./Openzeppelin.sol";

contract TransferEmulator is ERC20PresetFixedSupply {
    constructor(
        string memory name,
        string memory symbol,
        uint8 decimals,
        uint256 initialSupply,
        address owner
    ) public ERC20PresetFixedSupply(name, symbol, decimals, initialSupply, owner) {
    }

}

