// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {Forge} from "./Forge.sol";
import {Ingot} from "./Ingot.sol";

/// @title ForgeFactory — deploys and registers Forges.
contract ForgeFactory {
    address public immutable registry;
    address public immutable ingot;
    address public immutable splitter;

    Forge[] public allForges;
    mapping(address => bool) public isForge;

    event ForgeCreated(
        address indexed forge,
        address indexed creator,
        bytes32 modelSpec,
        bytes32 evalSpec,
        address evalCoordinator,
        uint64 contributionWindowEnds
    );

    error OnlyFactory();

    constructor(address registry_, address ingot_, address splitter_) {
        registry = registry_;
        ingot = ingot_;
        splitter = splitter_;
    }

    function createForge(
        bytes32 modelSpec,
        bytes32 evalSpec,
        address evalCoordinator,
        uint64 contributionWindowEnds
    ) external returns (address forge) {
        Forge f = new Forge(
            msg.sender,
            modelSpec,
            evalSpec,
            evalCoordinator,
            contributionWindowEnds,
            registry,
            ingot,
            splitter
        );
        forge = address(f);
        allForges.push(f);
        isForge[forge] = true;
        emit ForgeCreated(forge, msg.sender, modelSpec, evalSpec, evalCoordinator, contributionWindowEnds);
    }

    function count() external view returns (uint256) {
        return allForges.length;
    }

    /// @notice Called by the Ingot contract to enforce that only the factory
    ///         can mint new Ingots — Forges call this via their factory.
    function authorizedMint(address forge_) external view returns (bool) {
        return isForge[forge_];
    }
}
