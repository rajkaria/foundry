// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Ingot} from "./Ingot.sol";

/// @title RevenueSplitter — receives inference revenue per-Ingot, pull-payment claims.
/// @notice Uses checkpoint-based accounting so new payments don't require iterating
///         holder lists. Holders claim against the cumulative-per-share index.
contract RevenueSplitter is ReentrancyGuard {
    Ingot public immutable ingot;
    address public immutable treasury;

    uint16 public immutable feeBps; // protocol fee in basis points (e.g. 250 = 2.5%)

    /// @dev cumulative revenue distributed to a "1 share" position, scaled 1e18.
    mapping(uint256 => uint256) public cumulativePerShare;
    mapping(uint256 => uint256) public totalReceived;
    mapping(uint256 => uint256) public totalClaimed;

    /// @dev tokenId → holder → checkpoint of cumulativePerShare at last claim.
    mapping(uint256 => mapping(address => uint256)) public checkpoint;

    uint256 private constant ACC_SCALE = 1e18;

    event RevenueReceived(uint256 indexed tokenId, address indexed payer, uint256 amount, uint256 fee);
    event RevenueClaimed(uint256 indexed tokenId, address indexed holder, uint256 amount);

    error NothingToClaim();
    error ZeroPayment();

    constructor(address ingot_, address treasury_, uint16 feeBps_) {
        ingot = Ingot(ingot_);
        treasury = treasury_;
        feeBps = feeBps_;
    }

    /// @notice Inference revenue routes here, tagged with the Ingot being called.
    function receivePayment(uint256 tokenId) external payable {
        if (msg.value == 0) revert ZeroPayment();
        uint256 fee = (msg.value * feeBps) / 10_000;
        uint256 distributable = msg.value - fee;
        if (fee > 0) {
            (bool ok, ) = treasury.call{value: fee}("");
            require(ok, "treasury xfer failed");
        }
        uint128 issued = ingot.sharesTotalIssued(tokenId);
        require(issued > 0, "no shares issued");
        cumulativePerShare[tokenId] += (distributable * ACC_SCALE) / issued;
        totalReceived[tokenId] += msg.value;
        emit RevenueReceived(tokenId, msg.sender, msg.value, fee);
    }

    function claimable(uint256 tokenId, address holder) public view returns (uint256) {
        uint256 share = ingot.shareOf(tokenId, holder);
        if (share == 0) return 0;
        uint256 owed = (cumulativePerShare[tokenId] - checkpoint[tokenId][holder]) * share / ACC_SCALE;
        return owed;
    }

    function claim(uint256 tokenId) external nonReentrant returns (uint256 amount) {
        amount = claimable(tokenId, msg.sender);
        if (amount == 0) revert NothingToClaim();
        checkpoint[tokenId][msg.sender] = cumulativePerShare[tokenId];
        totalClaimed[tokenId] += amount;
        (bool ok, ) = msg.sender.call{value: amount}("");
        require(ok, "claim xfer failed");
        emit RevenueClaimed(tokenId, msg.sender, amount);
    }

    /// @dev When a new share is minted, we set the new holder's checkpoint to
    ///      the current cumulative so they don't claim historical revenue.
    /// @notice Should be called by the Forge after `allocateShare`.
    function syncCheckpoint(uint256 tokenId, address holder) external {
        checkpoint[tokenId][holder] = cumulativePerShare[tokenId];
    }
}
