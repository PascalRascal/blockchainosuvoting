var Election = artifacts.require("./Election.sol");


contract('Election', function(accounts) {
  it("should assert true", function(done) {
    var election = Election.deployed();
    assert.isTrue(true);
    done();
  });
});
