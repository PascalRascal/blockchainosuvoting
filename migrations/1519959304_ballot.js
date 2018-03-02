var Ballot = artifacts.require("./Ballot.sol");


module.exports = function(deployer) {
  // Use deployer to state migration tasks.
  deployer.deploy(Ballot, ["Test Ballot"], ["Facey McPresident"], ["Marcus Veepson"], ["Satoshi"], ["Vitalik"])
};
