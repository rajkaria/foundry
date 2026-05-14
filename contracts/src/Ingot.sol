// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";

interface IForgeFactory {
    function authorizedMint(address forge_) external view returns (bool);
}

/// @title Ingot — co-owned trained model on-chain.
/// @notice One ERC-721 per model + an internal share ledger (packed uint128).
///         Agent ID is the (chainId, address(this), tokenId) tuple.
contract Ingot is ERC721 {
    struct Meta {
        bytes32 weightsRoot;     // 0G Storage root of model weights
        bytes32 lineageParent;   // parent Ingot agent-id hash (0 if root)
        address forge;           // forge that minted this Ingot
        uint64  mintedAt;
        bool    weightsSet;
    }

    IForgeFactory public factory;
    address public immutable owner;
    uint256 private _nextId = 1;

    mapping(uint256 => Meta) public meta;

    /// @dev tokenId → holder → share (sum of shares = SHARE_TOTAL).
    mapping(uint256 => mapping(address => uint128)) public shares;
    mapping(uint256 => uint128) public sharesTotalIssued;

    uint128 public constant SHARE_TOTAL = 1_000_000; // 1.0 = 1e6

    event IngotMinted(uint256 indexed tokenId, address indexed forge);
    event ShareMinted(uint256 indexed tokenId, address indexed holder, uint128 share);
    event WeightsSet(uint256 indexed tokenId, bytes32 weightsRoot);
    event LineageLinked(uint256 indexed tokenId, bytes32 parent);

    error OnlyFactory();
    error OnlyForge();
    error OnlyOwner();
    error WeightsAlreadySet();
    error ShareOverflow();
    error FactoryAlreadySet();

    constructor() ERC721("Foundry Ingot", "INGOT") {
        owner = msg.sender;
    }

    /// @notice One-shot: owner wires the factory after both are deployed.
    function setFactory(address factory_) external {
        if (msg.sender != owner) revert OnlyOwner();
        if (address(factory) != address(0)) revert FactoryAlreadySet();
        factory = IForgeFactory(factory_);
    }

    /// @notice Called by an authorized Forge (verified via the factory).
    function mintTo(address forge_) external returns (uint256 tokenId) {
        if (!factory.authorizedMint(msg.sender)) revert OnlyFactory();
        tokenId = _nextId++;
        meta[tokenId] = Meta({
            weightsRoot: bytes32(0),
            lineageParent: bytes32(0),
            forge: forge_,
            mintedAt: uint64(block.timestamp),
            weightsSet: false
        });
        _safeMint(forge_, tokenId);
        emit IngotMinted(tokenId, forge_);
    }

    /// @notice Called by the Forge that minted this Ingot to allocate shares.
    function allocateShare(uint256 tokenId, address holder, uint128 share) external {
        if (msg.sender != meta[tokenId].forge) revert OnlyForge();
        uint128 newTotal = sharesTotalIssued[tokenId] + share;
        if (newTotal > SHARE_TOTAL) revert ShareOverflow();
        shares[tokenId][holder] += share;
        sharesTotalIssued[tokenId] = newTotal;
        emit ShareMinted(tokenId, holder, share);
    }

    /// @notice Called by the owning Forge once weights are persisted to 0G Storage.
    function setWeightsRoot(uint256 tokenId, bytes32 root) external {
        if (msg.sender != meta[tokenId].forge) revert OnlyForge();
        if (meta[tokenId].weightsSet) revert WeightsAlreadySet();
        meta[tokenId].weightsRoot = root;
        meta[tokenId].weightsSet = true;
        emit WeightsSet(tokenId, root);
    }

    function setLineageParent(uint256 tokenId, bytes32 parent) external {
        if (msg.sender != meta[tokenId].forge) revert OnlyForge();
        meta[tokenId].lineageParent = parent;
        emit LineageLinked(tokenId, parent);
    }

    function shareOf(uint256 tokenId, address holder) external view returns (uint128) {
        return shares[tokenId][holder];
    }
}
