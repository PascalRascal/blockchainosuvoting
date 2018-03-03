var Election = artifacts.require("./Election.sol");


module.exports = function(deployer) {
  // Use deployer to state migration tasks.
  deployer.deploy(Election, [["Facey McPresident"], ["Marcus Veepson"], ["Satoshi"], ["Vitalik"]], [1,1,1,1])
};
