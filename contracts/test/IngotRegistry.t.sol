// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {Test} from "forge-std/Test.sol";
import {ContributionRegistry} from "../src/ContributionRegistry.sol";
import {Ingot} from "../src/Ingot.sol";
import {RevenueSplitter} from "../src/RevenueSplitter.sol";
import {ForgeFactory} from "../src/ForgeFactory.sol";
import {Forge} from "../src/Forge.sol";
import {IngotRegistry} from "../src/IngotRegistry.sol";

contract IngotRegistryTest is Test {
    ContributionRegistry registry;
    Ingot ingot;
    RevenueSplitter splitter;
    ForgeFactory factory;
    IngotRegistry providerRegistry;

    address treasury = address(0xBEEF);
    address creator = address(0xCAFE);
    address coordinator = address(0xC00D);
    address elena = address(0xE1E4A);
    address provider1 = address(0xABCD1);
    address provider2 = address(0xABCD2);
    address attacker = address(0xBAD);

    uint256 tokenId;

    function setUp() public {
        registry = new ContributionRegistry();
        ingot = new Ingot();
        splitter = new RevenueSplitter(address(ingot), treasury, 250);
        factory = new ForgeFactory(address(registry), address(ingot), address(splitter));
        ingot.setFactory(address(factory));
        providerRegistry = new IngotRegistry(address(ingot));

        // Mint a real Ingot end-to-end so ownerOf() resolves.
        vm.startPrank(creator);
        address forgeAddr = factory.createForge(
            bytes32(uint256(1)), bytes32(uint256(2)), coordinator, uint64(block.timestamp + 1 hours)
        );
        Forge forge = Forge(payable(forgeAddr));
        vm.stopPrank();

        vm.prank(elena);
        forge.contributeData(bytes32(uint256(0xDA7A)));

        vm.warp(block.timestamp + 2 hours);
        forge.startEvaluating();

        uint64[] memory scores = new uint64[](1);
        scores[0] = 1_000_000;
        vm.prank(coordinator);
        forge.submitEvalResult(bytes32(uint256(0xA77E57)), scores);

        forge.mintOwnership();
        tokenId = forge.tokenId();

        vm.prank(creator);
        forge.setWeightsAndGoLive(bytes32(uint256(0xFEED)), bytes32(0));
    }

    function test_setProvider_byOwner() public {
        address ingotOwner = ingot.ownerOf(tokenId);
        vm.prank(ingotOwner);
        providerRegistry.setProvider(tokenId, provider1, "llama-3.1-8b", "https://compute.0g.network/p/1");

        (address p, string memory model, string memory endpoint, address setBy, uint64 ts) =
            providerRegistry.providerOf(tokenId);
        assertEq(p, provider1);
        assertEq(model, "llama-3.1-8b");
        assertEq(endpoint, "https://compute.0g.network/p/1");
        assertEq(setBy, ingotOwner);
        assertEq(ts, uint64(block.timestamp));
        assertTrue(providerRegistry.isSet(tokenId));
    }

    function test_setProvider_byNonOwner_reverts() public {
        vm.prank(attacker);
        vm.expectRevert(IngotRegistry.NotOwner.selector);
        providerRegistry.setProvider(tokenId, provider1, "m", "e");
    }

    function test_setProvider_zeroProvider_reverts() public {
        address ingotOwner = ingot.ownerOf(tokenId);
        vm.prank(ingotOwner);
        vm.expectRevert(IngotRegistry.ProviderZero.selector);
        providerRegistry.setProvider(tokenId, address(0), "m", "e");
    }

    function test_setProvider_rotate() public {
        address ingotOwner = ingot.ownerOf(tokenId);
        vm.startPrank(ingotOwner);
        providerRegistry.setProvider(tokenId, provider1, "m1", "e1");
        providerRegistry.setProvider(tokenId, provider2, "m2", "e2");
        vm.stopPrank();

        (address p,,,,) = providerRegistry.providerOf(tokenId);
        assertEq(p, provider2);
    }

    function test_isSet_default() public view {
        assertFalse(providerRegistry.isSet(999));
    }
}
