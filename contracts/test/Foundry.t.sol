// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {Test} from "forge-std/Test.sol";
import {FORGEToken} from "../src/FORGEToken.sol";
import {ContributionRegistry} from "../src/ContributionRegistry.sol";
import {Ingot} from "../src/Ingot.sol";
import {RevenueSplitter} from "../src/RevenueSplitter.sol";
import {ForgeFactory} from "../src/ForgeFactory.sol";
import {Forge} from "../src/Forge.sol";

contract FoundryTest is Test {
    FORGEToken token;
    ContributionRegistry registry;
    Ingot ingot;
    RevenueSplitter splitter;
    ForgeFactory factory;

    address treasury = address(0xBEEF);
    address creator = address(0xCAFE);
    address coordinator = address(0xC00D);
    address maya = address(0xMA7A);
    address priya = address(0xBABE);
    address devansh = address(0xD00D);

    function setUp() public {
        token = new FORGEToken(treasury);
        registry = new ContributionRegistry();
        ingot = new Ingot();
        splitter = new RevenueSplitter(address(ingot), treasury, 250); // 2.5%
        factory = new ForgeFactory(address(registry), address(ingot), address(splitter));
        ingot.setFactory(address(factory));
    }

    function test_TokenSupply() public view {
        assertEq(token.totalSupply(), 1_000_000_000 ether);
        assertEq(token.balanceOf(treasury), 1_000_000_000 ether);
    }

    function test_FullForgeLoop() public {
        // 1. Create a Forge
        uint64 windowEnds = uint64(block.timestamp + 1 days);
        vm.prank(creator);
        address forgeAddr = factory.createForge(
            bytes32("modelspec"),
            bytes32("evalspec"),
            coordinator,
            windowEnds
        );
        Forge forge = Forge(forgeAddr);
        assertTrue(factory.isForge(forgeAddr));

        // 2. Contributions: Maya data, Priya compute, Devansh capital
        vm.prank(maya);
        forge.contributeData(keccak256("maya-corpus"));

        vm.deal(priya, 1 ether);
        vm.prank(priya);
        forge.contributeCompute{value: 0.5 ether}(0.5 ether);

        vm.deal(devansh, 1 ether);
        vm.prank(devansh);
        forge.fundForge{value: 0.3 ether}();

        assertEq(forge.contributionsCount(), 3);

        // 3. Close window, transition to Evaluating
        vm.warp(windowEnds + 1);
        forge.startEvaluating();
        assertEq(uint8(forge.state()), uint8(Forge.State.Evaluating));

        // 4. Submit eval result (TEE attestation + score vector)
        uint64[] memory scores = new uint64[](3);
        scores[0] = 800_000;  // Maya's data: 0.8 marginal Δ
        scores[1] = 0;        // compute amounts only count by amount, not score
        scores[2] = 0;

        vm.prank(coordinator);
        forge.submitEvalResult(keccak256("attestation"), scores);
        assertEq(uint8(forge.state()), uint8(Forge.State.Minting));

        // 5. Mint ownership
        forge.mintOwnership();
        assertEq(uint8(forge.state()), uint8(Forge.State.Training));

        uint256 tokenId = forge.tokenId();
        // Maya holds 70% of shares; Priya holds 20%; Devansh holds 10%.
        uint128 mayaShare = ingot.shareOf(tokenId, maya);
        uint128 priyaShare = ingot.shareOf(tokenId, priya);
        uint128 devanshShare = ingot.shareOf(tokenId, devansh);
        assertGt(mayaShare, 0);
        assertGt(priyaShare, 0);
        assertGt(devanshShare, 0);
        // Maya should have the largest share due to 70% data weight + sole data contribution
        assertGt(mayaShare, priyaShare);
        assertGt(mayaShare, devanshShare);

        // 6. Set weights and go live
        vm.prank(creator);
        forge.setWeightsAndGoLive(keccak256("weights-root"), bytes32(0));
        assertEq(uint8(forge.state()), uint8(Forge.State.Live));

        // 7. Revenue distribution
        uint256 payment = 1 ether;
        vm.deal(address(this), payment);
        splitter.receivePayment{value: payment}(tokenId);

        uint256 mayaClaimable = splitter.claimable(tokenId, maya);
        assertGt(mayaClaimable, 0);

        // 8. Maya claims
        uint256 mayaBefore = maya.balance;
        vm.prank(maya);
        uint256 claimed = splitter.claim(tokenId);
        assertEq(claimed, mayaClaimable);
        assertEq(maya.balance, mayaBefore + claimed);

        // Treasury got the 2.5% fee
        assertEq(treasury.balance, payment * 250 / 10_000);
    }

    function test_ContributionWindowCloses() public {
        uint64 windowEnds = uint64(block.timestamp + 1 hours);
        vm.prank(creator);
        Forge forge = Forge(factory.createForge(
            bytes32("ms"), bytes32("es"), coordinator, windowEnds
        ));

        vm.warp(windowEnds + 1);
        vm.expectRevert(Forge.ContributionWindowClosed.selector);
        vm.prank(maya);
        forge.contributeData(keccak256("x"));
    }

    function test_OnlyEvalCoordinatorCanSubmit() public {
        uint64 windowEnds = uint64(block.timestamp + 1 hours);
        vm.prank(creator);
        Forge forge = Forge(factory.createForge(
            bytes32("ms"), bytes32("es"), coordinator, windowEnds
        ));
        vm.prank(maya);
        forge.contributeData(keccak256("x"));

        vm.warp(windowEnds + 1);
        forge.startEvaluating();

        uint64[] memory scores = new uint64[](1);
        scores[0] = 1;

        vm.prank(maya);
        vm.expectRevert(Forge.NotEvalCoordinator.selector);
        forge.submitEvalResult(keccak256("attest"), scores);
    }

    function test_AttestationCannotBeZero() public {
        uint64 windowEnds = uint64(block.timestamp + 1 hours);
        vm.prank(creator);
        Forge forge = Forge(factory.createForge(
            bytes32("ms"), bytes32("es"), coordinator, windowEnds
        ));
        vm.prank(maya);
        forge.contributeData(keccak256("x"));
        vm.warp(windowEnds + 1);
        forge.startEvaluating();

        uint64[] memory scores = new uint64[](1);
        scores[0] = 1;

        vm.prank(coordinator);
        vm.expectRevert(Forge.InvalidAttestation.selector);
        forge.submitEvalResult(bytes32(0), scores);
    }

    function test_PerWalletCap() public {
        uint64 windowEnds = uint64(block.timestamp + 1 hours);
        vm.prank(creator);
        Forge forge = Forge(factory.createForge(
            bytes32("ms"), bytes32("es"), coordinator, windowEnds
        ));
        for (uint256 i = 0; i < 5; ++i) {
            vm.prank(maya);
            forge.contributeData(bytes32(i));
        }
        vm.expectRevert(Forge.CapHit.selector);
        vm.prank(maya);
        forge.contributeData(bytes32(uint256(99)));
    }

    receive() external payable {}
}
