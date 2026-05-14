// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

/// @title ContributionRegistry — append-only log of every contribution across all Forges.
/// @notice Data source for the lineage graph and the public dashboard.
contract ContributionRegistry {
    enum ContributionType { Data, Compute, Capital }

    struct Contribution {
        address smith;
        address forge;
        ContributionType ctype;
        bytes32 storageRoot;   // 0G Storage root for Data; otherwise 0
        uint128 amount;        // amount in wei (Compute credits or Capital)
        uint64  timestamp;
        uint64  score;         // measured marginal Δ × 1e6 (filled after eval)
    }

    Contribution[] private _contributions;
    mapping(address => uint256[]) public byForge;
    mapping(address => uint256[]) public bySmith;

    event ContributionLogged(
        uint256 indexed id,
        address indexed smith,
        address indexed forge,
        ContributionType ctype,
        bytes32 storageRoot,
        uint128 amount,
        uint64 timestamp
    );

    event ContributionScored(uint256 indexed id, uint64 score);

    error OnlyForge();

    /// @notice Called by a Forge to append a contribution.
    /// @dev The Forge enforces who can call its `contributeX` methods; this
    ///      contract trusts the caller is a Forge for the {forge} field.
    function log(
        address smith,
        ContributionType ctype,
        bytes32 storageRoot,
        uint128 amount
    ) external returns (uint256 id) {
        id = _contributions.length;
        _contributions.push(
            Contribution({
                smith: smith,
                forge: msg.sender,
                ctype: ctype,
                storageRoot: storageRoot,
                amount: amount,
                timestamp: uint64(block.timestamp),
                score: 0
            })
        );
        byForge[msg.sender].push(id);
        bySmith[smith].push(id);
        emit ContributionLogged(id, smith, msg.sender, ctype, storageRoot, amount, uint64(block.timestamp));
    }

    /// @notice Called by a Forge after eval completes — writes the measured Δ × 1e6.
    function score(uint256 id, uint64 measured) external {
        Contribution storage c = _contributions[id];
        if (c.forge != msg.sender) revert OnlyForge();
        c.score = measured;
        emit ContributionScored(id, measured);
    }

    function get(uint256 id) external view returns (Contribution memory) {
        return _contributions[id];
    }

    function count() external view returns (uint256) {
        return _contributions.length;
    }
}
