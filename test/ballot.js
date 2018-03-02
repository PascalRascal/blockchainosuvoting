var Ballot = artifacts.require("./Ballot.sol");


contract('Ballot', function(accounts) {
  it("should assert true", function(done) {
    var ballot = Ballot.deployed();
    assert.isTrue(true);
    done();
  });
});
