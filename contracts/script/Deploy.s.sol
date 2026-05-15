// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {FORGEToken} from "../src/FORGEToken.sol";
import {ContributionRegistry} from "../src/ContributionRegistry.sol";
import {Ingot} from "../src/Ingot.sol";
import {RevenueSplitter} from "../src/RevenueSplitter.sol";
import {ForgeFactory} from "../src/ForgeFactory.sol";
import {IngotRegistry} from "../src/IngotRegistry.sol";

/// @notice Deploys the full Foundry suite to a 0G network.
///
/// Env required:
///   - DEPLOYER_KEY     uint        private key of the funded deployer
///   - TREASURY_ADDR    address     receives the FORGE supply + protocol fee
///   - FOUNDRY_NET      string      one of: local | galileo | aristotle
///                                  (renamed from FOUNDRY_NETWORK because
///                                  forge reserves that key for its built-in
///                                  network config and rejects unknown values)
///                                  (controls the deployments/<name>.json path)
///
/// Run:
///   forge script script/Deploy.s.sol --rpc-url $RPC --broadcast --verify
contract Deploy is Script {
    function run() external {
        address treasury = vm.envAddress("TREASURY_ADDR");
        uint256 deployerKey = vm.envUint("DEPLOYER_KEY");
        string memory network = vm.envOr("FOUNDRY_NET", string("aristotle"));

        vm.startBroadcast(deployerKey);

        FORGEToken token = new FORGEToken(treasury);
        ContributionRegistry registry = new ContributionRegistry();
        Ingot ingot = new Ingot();
        RevenueSplitter splitter = new RevenueSplitter(address(ingot), treasury, 250);
        ForgeFactory factory =
            new ForgeFactory(address(registry), address(ingot), address(splitter));
        ingot.setFactory(address(factory));
        IngotRegistry ingotRegistry = new IngotRegistry(address(ingot));

        vm.stopBroadcast();

        console.log("network              %s", network);
        console.log("chainId              %s", vm.toString(block.chainid));
        console.log("FORGEToken           %s", address(token));
        console.log("ContributionRegistry %s", address(registry));
        console.log("Ingot                %s", address(ingot));
        console.log("RevenueSplitter      %s", address(splitter));
        console.log("ForgeFactory         %s", address(factory));
        console.log("IngotRegistry        %s", address(ingotRegistry));

        string memory json = string.concat(
            "{",
            '"_network":"',
            network,
            '",',
            '"_chainId":',
            vm.toString(block.chainid),
            ",",
            '"_deployedAt":',
            vm.toString(block.timestamp),
            ",",
            '"FORGEToken":"',
            vm.toString(address(token)),
            '",',
            '"ContributionRegistry":"',
            vm.toString(address(registry)),
            '",',
            '"Ingot":"',
            vm.toString(address(ingot)),
            '",',
            '"RevenueSplitter":"',
            vm.toString(address(splitter)),
            '",',
            '"ForgeFactory":"',
            vm.toString(address(factory)),
            '",',
            '"IngotRegistry":"',
            vm.toString(address(ingotRegistry)),
            '"',
            "}"
        );
        string memory path = string.concat("deployments/", network, ".json");
        vm.writeFile(path, json);
        console.log("wrote                %s", path);
    }
}
