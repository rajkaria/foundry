// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {Ingot} from "./Ingot.sol";

/// @title IngotRegistry — maps an Ingot tokenId to its 0G Compute provider + model.
/// @notice The OpenAI-compatible inference proxy needs to know which 0G Compute
///         provider to dispatch to when a request arrives tagged with
///         `model: "ingot:0x…/N"`. This registry is the on-chain source of truth.
///
/// Only the Ingot's primary holder (the address with the largest share, or
/// the Ingot's NFT owner) may set the provider. We keep the rule simple: the
/// current ERC-721 owner can write. The Forge contract sets the initial
/// provider when the Ingot transitions to `Live`; the holder can rotate it later.
contract IngotRegistry {
    Ingot public immutable ingot;

    struct Provider {
        address provider;   // 0G Compute on-chain provider address
        string model;       // model identifier the provider serves
        string endpoint;    // optional cached endpoint URL (off-chain hint)
        address setBy;      // who last wrote this entry
        uint64  updatedAt;
    }

    mapping(uint256 => Provider) private _providers;

    event ProviderSet(
        uint256 indexed tokenId,
        address indexed provider,
        string model,
        string endpoint
    );

    error NotOwner();
    error ProviderZero();

    constructor(address ingot_) {
        ingot = Ingot(ingot_);
    }

    /// @notice Set or rotate the Ingot's provider. Only the current NFT owner.
    function setProvider(
        uint256 tokenId,
        address provider,
        string calldata model,
        string calldata endpoint
    ) external {
        if (ingot.ownerOf(tokenId) != msg.sender) revert NotOwner();
        if (provider == address(0)) revert ProviderZero();
        _providers[tokenId] = Provider({
            provider: provider,
            model: model,
            endpoint: endpoint,
            setBy: msg.sender,
            updatedAt: uint64(block.timestamp)
        });
        emit ProviderSet(tokenId, provider, model, endpoint);
    }

    function providerOf(uint256 tokenId)
        external
        view
        returns (address provider, string memory model, string memory endpoint, address setBy, uint64 updatedAt)
    {
        Provider memory p = _providers[tokenId];
        return (p.provider, p.model, p.endpoint, p.setBy, p.updatedAt);
    }

    function isSet(uint256 tokenId) external view returns (bool) {
        return _providers[tokenId].provider != address(0);
    }
}
