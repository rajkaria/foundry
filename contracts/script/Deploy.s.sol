// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {FORGEToken} from "../src/FORGEToken.sol";
import {ContributionRegistry} from "../src/ContributionRegistry.sol";
import {Ingot} from "../src/Ingot.sol";
import {RevenueSplitter} from "../src/RevenueSplitter.sol";
import {ForgeFactory} from "../src/ForgeFactory.sol";

/// @notice Deploys the full Foundry suite to 0G Aristotle mainnet.
/// @dev Run:
///        forge script script/Deploy.s.sol \
///          --rpc-url aristotle --broadcast --verify
///      Env required: RPC_ARISTOTLE, DEPLOYER_KEY, TREASURY_ADDR.
contract Deploy is Script {
    function run() external {
        address treasury = vm.envAddress("TREASURY_ADDR");
        uint256 deployerKey = vm.envUint("DEPLOYER_KEY");

        vm.startBroadcast(deployerKey);

        FORGEToken token = new FORGEToken(treasury);
        ContributionRegistry registry = new ContributionRegistry();
        Ingot ingot = new Ingot();
        RevenueSplitter splitter = new RevenueSplitter(address(ingot), treasury, 250);
        ForgeFactory factory = new ForgeFactory(address(registry), address(ingot), address(splitter));
        ingot.setFactory(address(factory));

        vm.stopBroadcast();

        console.log("FORGEToken          %s", address(token));
        console.log("ContributionRegistry %s", address(registry));
        console.log("Ingot                %s", address(ingot));
        console.log("RevenueSplitter      %s", address(splitter));
        console.log("ForgeFactory         %s", address(factory));

        string memory json = string.concat(
            '{"FORGEToken":"', vm.toString(address(token)),
            '","ContributionRegistry":"', vm.toString(address(registry)),
            '","Ingot":"', vm.toString(address(ingot)),
            '","RevenueSplitter":"', vm.toString(address(splitter)),
            '","ForgeFactory":"', vm.toString(address(factory)),
            '"}'
        );
        vm.writeFile("deployments/aristotle.json", json);
    }
}
