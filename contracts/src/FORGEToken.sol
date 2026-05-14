// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @title FORGEToken — contribution-accounting + governance token for Foundry.
/// @notice Fixed supply at deploy. Used to denominate Ingot ownership shares
///         and (post-hackathon) governance votes.
contract FORGEToken is ERC20, Ownable {
    uint256 public constant TOTAL_SUPPLY = 1_000_000_000 ether;

    constructor(address treasury) ERC20("Foundry", "FORGE") Ownable(msg.sender) {
        _mint(treasury, TOTAL_SUPPLY);
    }
}
