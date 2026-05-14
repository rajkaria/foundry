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
    address elena = address(0xE1E4A); // data Smith
    address aiko = address(0xA1C0); // GPU Smith
    address marcus = address(0xCA51A1); // capital Smith

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

        // 2. Contributions: Elena data, Aiko compute, Marcus capital
        vm.prank(elena);
        forge.contributeData(keccak256("elena-corpus"));

        vm.deal(aiko, 1 ether);
        vm.prank(aiko);
        forge.contributeCompute{value: 0.5 ether}(0.5 ether);

        vm.deal(marcus, 1 ether);
        vm.prank(marcus);
        forge.fundForge{value: 0.3 ether}();

        assertEq(forge.contributionsCount(), 3);

        // 3. Close window, transition to Evaluating
        vm.warp(windowEnds + 1);
        forge.startEvaluating();
        assertEq(uint8(forge.state()), uint8(Forge.State.Evaluating));

        // 4. Submit eval result (TEE attestation + score vector)
        uint64[] memory scores = new uint64[](3);
        scores[0] = 800_000; // Elena's data: 0.8 marginal Δ
        scores[1] = 0; // compute amounts only count by amount, not score
        scores[2] = 0;

        vm.prank(coordinator);
        forge.submitEvalResult(keccak256("attestation"), scores);
        assertEq(uint8(forge.state()), uint8(Forge.State.Minting));

        // 5. Mint ownership
        forge.mintOwnership();
        assertEq(uint8(forge.state()), uint8(Forge.State.Training));

        uint256 tokenId = forge.tokenId();
        // Elena holds 70% of shares; Aiko holds 20%; Marcus holds 10%.
        uint128 elenaShare = ingot.shareOf(tokenId, elena);
        uint128 aikoShare = ingot.shareOf(tokenId, aiko);
        uint128 marcusShare = ingot.shareOf(tokenId, marcus);
        assertGt(elenaShare, 0);
        assertGt(aikoShare, 0);
        assertGt(marcusShare, 0);
        // Elena should have the largest share — 70% data weight + sole data contribution.
        assertGt(elenaShare, aikoShare);
        assertGt(elenaShare, marcusShare);

        // 6. Set weights and go live
        vm.prank(creator);
        forge.setWeightsAndGoLive(keccak256("weights-root"), bytes32(0));
        assertEq(uint8(forge.state()), uint8(Forge.State.Live));

        // 7. Revenue distribution
        uint256 payment = 1 ether;
        vm.deal(address(this), payment);
        splitter.receivePayment{value: payment}(tokenId);

        uint256 elenaClaimable = splitter.claimable(tokenId, elena);
        assertGt(elenaClaimable, 0);

        // 8. Elena claims
        uint256 elenaBefore = elena.balance;
        vm.prank(elena);
        uint256 claimed = splitter.claim(tokenId);
        assertEq(claimed, elenaClaimable);
        assertEq(elena.balance, elenaBefore + claimed);

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
        vm.prank(elena);
        forge.contributeData(keccak256("x"));
    }

    function test_OnlyEvalCoordinatorCanSubmit() public {
        uint64 windowEnds = uint64(block.timestamp + 1 hours);
        vm.prank(creator);
        Forge forge = Forge(factory.createForge(
            bytes32("ms"), bytes32("es"), coordinator, windowEnds
        ));
        vm.prank(elena);
        forge.contributeData(keccak256("x"));

        vm.warp(windowEnds + 1);
        forge.startEvaluating();

        uint64[] memory scores = new uint64[](1);
        scores[0] = 1;

        vm.prank(elena);
        vm.expectRevert(Forge.NotEvalCoordinator.selector);
        forge.submitEvalResult(keccak256("attest"), scores);
    }

    function test_AttestationCannotBeZero() public {
        uint64 windowEnds = uint64(block.timestamp + 1 hours);
        vm.prank(creator);
        Forge forge = Forge(factory.createForge(
            bytes32("ms"), bytes32("es"), coordinator, windowEnds
        ));
        vm.prank(elena);
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
            vm.prank(elena);
            forge.contributeData(bytes32(i));
        }
        vm.expectRevert(Forge.CapHit.selector);
        vm.prank(elena);
        forge.contributeData(bytes32(uint256(99)));
    }

    receive() external payable {}
}
