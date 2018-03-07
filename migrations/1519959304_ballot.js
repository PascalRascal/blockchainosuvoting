var Election = artifacts.require("./Election.sol");


module.exports = function(deployer) {
  // Use deployer to state migration tasks.
  deployer.deploy(Election, ["Facey McPresident", "Bob Dole", "Marcus Veepson", "Buttcoin", "Charlie Lee", "Satoshi", "Bitbean Bean", "Vitalik", "Carlos"], [2,3,2,2])
};
