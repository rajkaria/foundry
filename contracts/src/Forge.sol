// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IERC721Receiver} from "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import {ContributionRegistry} from "./ContributionRegistry.sol";
import {Ingot} from "./Ingot.sol";
import {RevenueSplitter} from "./RevenueSplitter.sol";

/// @title Forge — one training collective.
/// @notice State machine:
///   OPEN → EVALUATING → MINTING → TRAINING → LIVE.
///   Anti-abuse: contribution window closes before eval; eval coordinator
///   address is immutable post-creation; eval result must carry a valid TEE
///   attestation or the call reverts.
contract Forge is ReentrancyGuard, IERC721Receiver {
    enum State { Open, Evaluating, Minting, Training, Live }

    /* immutable spec */
    address public immutable creator;
    bytes32 public immutable modelSpec;        // 0G Storage ref to training config
    bytes32 public immutable evalSpec;         // 0G Storage ref to holdout (encrypted)
    address public immutable evalCoordinator;  // who can submitEvalResult
    uint64  public immutable contributionWindowEnds;
    ContributionRegistry public immutable registry;
    Ingot public immutable ingot;
    RevenueSplitter public immutable splitter;

    /* config — proportional ownership weights (in basis points, sum 10_000) */
    uint16 public constant DATA_WEIGHT_BPS    = 7_000;  // 70%
    uint16 public constant COMPUTE_WEIGHT_BPS = 2_000;  // 20%
    uint16 public constant CAPITAL_WEIGHT_BPS = 1_000;  // 10%

    /* sybil resistance: per-wallet caps per forge */
    uint128 public constant MAX_CONTRIBUTIONS_PER_WALLET = 5;
    mapping(address => uint128) public contributionCountByWallet;

    /* state */
    State public state;
    uint256 public tokenId;
    uint256[] public contributionIds;
    mapping(address => uint256) public escrowedCapital;
    mapping(address => uint256) public escrowedCompute;

    /* eval result */
    bytes32 public attestation;

    event StateChanged(State oldState, State newState);
    event ContributionAdded(uint256 indexed contributionId, address indexed smith, ContributionRegistry.ContributionType ctype);
    event EvalSubmitted(bytes32 attestation, uint64[] scores);
    event IngotForged(uint256 indexed tokenId);

    error NotInState(State expected);
    error ContributionWindowClosed();
    error ContributionWindowOpen();
    error NotEvalCoordinator();
    error InvalidAttestation();
    error CapHit();
    error LengthMismatch();
    error ZeroValue();

    modifier inState(State s) {
        if (state != s) revert NotInState(s);
        _;
    }

    constructor(
        address creator_,
        bytes32 modelSpec_,
        bytes32 evalSpec_,
        address evalCoordinator_,
        uint64  contributionWindowEnds_,
        address registry_,
        address ingot_,
        address splitter_
    ) {
        creator = creator_;
        modelSpec = modelSpec_;
        evalSpec = evalSpec_;
        evalCoordinator = evalCoordinator_;
        contributionWindowEnds = contributionWindowEnds_;
        registry = ContributionRegistry(registry_);
        ingot = Ingot(ingot_);
        splitter = RevenueSplitter(splitter_);
        state = State.Open;
        emit StateChanged(State.Open, State.Open);
    }

    /* ─── intake ───────────────────────────────────────────────────────── */

    function contributeData(bytes32 storageRoot) external inState(State.Open) returns (uint256 id) {
        if (block.timestamp >= contributionWindowEnds) revert ContributionWindowClosed();
        _bumpCap(msg.sender);
        id = registry.log(msg.sender, ContributionRegistry.ContributionType.Data, storageRoot, 0);
        contributionIds.push(id);
        emit ContributionAdded(id, msg.sender, ContributionRegistry.ContributionType.Data);
    }

    function contributeCompute(uint128 amount) external payable inState(State.Open) returns (uint256 id) {
        if (block.timestamp >= contributionWindowEnds) revert ContributionWindowClosed();
        if (amount == 0 || msg.value < amount) revert ZeroValue();
        _bumpCap(msg.sender);
        escrowedCompute[msg.sender] += amount;
        id = registry.log(msg.sender, ContributionRegistry.ContributionType.Compute, bytes32(0), amount);
        contributionIds.push(id);
        emit ContributionAdded(id, msg.sender, ContributionRegistry.ContributionType.Compute);
    }

    function fundForge() external payable inState(State.Open) returns (uint256 id) {
        if (block.timestamp >= contributionWindowEnds) revert ContributionWindowClosed();
        if (msg.value == 0) revert ZeroValue();
        _bumpCap(msg.sender);
        escrowedCapital[msg.sender] += msg.value;
        id = registry.log(msg.sender, ContributionRegistry.ContributionType.Capital, bytes32(0), uint128(msg.value));
        contributionIds.push(id);
        emit ContributionAdded(id, msg.sender, ContributionRegistry.ContributionType.Capital);
    }

    /* ─── state transitions ────────────────────────────────────────────── */

    /// @notice After contribution window closes, anyone can flip to Evaluating.
    function startEvaluating() external inState(State.Open) {
        if (block.timestamp < contributionWindowEnds) revert ContributionWindowOpen();
        _transition(State.Evaluating);
    }

    /// @notice Called by the registered eval coordinator with the TEE result.
    /// @param attestation_ TEE hardware-signed attestation hash.
    /// @param scores       per-contributionId marginal Δ × 1e6, in the same order
    ///                     as `contributionIds` (so we can score by index).
    function submitEvalResult(bytes32 attestation_, uint64[] calldata scores)
        external
        inState(State.Evaluating)
    {
        if (msg.sender != evalCoordinator) revert NotEvalCoordinator();
        if (attestation_ == bytes32(0)) revert InvalidAttestation();
        if (scores.length != contributionIds.length) revert LengthMismatch();

        attestation = attestation_;
        for (uint256 i = 0; i < scores.length; ++i) {
            registry.score(contributionIds[i], scores[i]);
        }
        emit EvalSubmitted(attestation_, scores);
        _transition(State.Minting);
    }

    /// @notice Mints the Ingot and allocates proportional shares.
    function mintOwnership() external inState(State.Minting) nonReentrant {
        tokenId = ingot.mintTo(address(this));
        emit IngotForged(tokenId);

        // 1. compute per-bucket totals
        uint256 totalDataScore;
        uint256 totalComputeAmount;
        uint256 totalCapitalAmount;
        uint256 n = contributionIds.length;

        for (uint256 i = 0; i < n; ++i) {
            ContributionRegistry.Contribution memory c = registry.get(contributionIds[i]);
            if (c.ctype == ContributionRegistry.ContributionType.Data) {
                totalDataScore += c.score;
            } else if (c.ctype == ContributionRegistry.ContributionType.Compute) {
                totalComputeAmount += c.amount;
            } else {
                totalCapitalAmount += c.amount;
            }
        }

        // 2. allocate proportional shares within each bucket weighted by bucket bps
        uint128 issued;
        for (uint256 i = 0; i < n; ++i) {
            ContributionRegistry.Contribution memory c = registry.get(contributionIds[i]);
            uint128 share;
            if (c.ctype == ContributionRegistry.ContributionType.Data && totalDataScore > 0) {
                share = uint128(uint256(c.score) * DATA_WEIGHT_BPS * 100 / totalDataScore);
            } else if (c.ctype == ContributionRegistry.ContributionType.Compute && totalComputeAmount > 0) {
                share = uint128(uint256(c.amount) * COMPUTE_WEIGHT_BPS * 100 / totalComputeAmount);
            } else if (c.ctype == ContributionRegistry.ContributionType.Capital && totalCapitalAmount > 0) {
                share = uint128(uint256(c.amount) * CAPITAL_WEIGHT_BPS * 100 / totalCapitalAmount);
            }
            if (share > 0) {
                ingot.allocateShare(tokenId, c.smith, share);
                splitter.syncCheckpoint(tokenId, c.smith);
                issued += share;
            }
        }

        _transition(State.Training);
    }

    /// @notice Forge creator sets weights root after off-chain final training run.
    function setWeightsAndGoLive(bytes32 weightsRoot, bytes32 lineageParent)
        external
        inState(State.Training)
    {
        require(msg.sender == creator, "only creator");
        ingot.setWeightsRoot(tokenId, weightsRoot);
        if (lineageParent != bytes32(0)) {
            ingot.setLineageParent(tokenId, lineageParent);
        }
        _transition(State.Live);
    }

    /* ─── views ────────────────────────────────────────────────────────── */

    function contributionsCount() external view returns (uint256) {
        return contributionIds.length;
    }

    /* ─── internals ────────────────────────────────────────────────────── */

    function _transition(State next) internal {
        State prev = state;
        state = next;
        emit StateChanged(prev, next);
    }

    function _bumpCap(address smith) internal {
        uint128 n = contributionCountByWallet[smith] + 1;
        if (n > MAX_CONTRIBUTIONS_PER_WALLET) revert CapHit();
        contributionCountByWallet[smith] = n;
    }

    /// @notice Accept Ingots minted to this contract by Ingot.mintTo (safeMint).
    function onERC721Received(
        address,
        address,
        uint256,
        bytes calldata
    ) external pure override returns (bytes4) {
        return IERC721Receiver.onERC721Received.selector;
    }
}
