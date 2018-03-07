var Election = artifacts.require("./Election.sol");
/*
contract('Election', async (accounts) => {
  it("should make the address deploying the contract the chairman", async () => {
    let election = await Election.deployed();

    let vw = await election.votingWeightOf(accounts[0], {from: accounts[0]})
    let chairPerson = await election.chairperson();

    assert.equal(chairPerson, accounts[0], "The Deployer Address is not the chairperson")
  })
  it("should allow the chairperson to approve an address, and the address should vote", async () => {
    let election = await Election.deployed();
    let choices = [1,1,1,1]

    // Grant a different account the right to vote
    await election.giveRightToVote(accounts[1], {from: accounts[0]})

    // Actually vote
    await election.castVotes(choices, {from: accounts[1]})

    // Verify that our votes were recorded on chain
    let votes = await election.getVotes(accounts[1])
    votes.forEach((v, i) => {
      assert.equal(choices[i], v, "Contract failed to record the voter choosing candidate " + choices[i] + " instead choosing candidate " + v);
    })
    
    
  })
  it("should allow for an empty ballot", async () => {
    let election = await Election.deployed();
    await election.castVotes([0,0,0,0], {from: accounts[0]})
    let didVote = await election.didVote(accounts[0])
    let votes = await election.getVotes(accounts[0])
    votes.forEach((v) => assert.equal(0, v, "The chain did not record the empty ballot"))
    assert.isTrue(didVote, "The chain did not record the user voting")
  })
});
*/

contract('Mock Election', async (accounts) => {
  it("should be able to function with a mock election", async () => {
    let election = await Election.deployed();

    let vw = await election.votingWeightOf(accounts[0], {from: accounts[0]})
    let chairPerson = await election.chairperson();

    assert.equal(chairPerson, accounts[0], "The Deployer Address is not the chairperson")
    
    let c1 = [1,1,0,1]
    let c2 = [1,1,0,1]
    let c3 = [1,1,0,1]
    let c4 = [1,1,0,1]
    let c5 = [1,1,0,1]
    let votes = [
      c1,c2,c3,c4,c5
    ]

    for(var i = 1; i < 5; i++){
      await election.giveRightToVote(accounts[i], {from: accounts[0]})
    }
    for(var i = 0; i < 5; i++){
      await election.castVotes(votes[i], {from: accounts[i]})
    }

    for(var i = 0; i < 5; i++){
      let vote = await election.didVote(accounts[1])
      assert.isTrue(vote, "Account " + i + " was not recorded voting");  
    }

    let results = await election.getStandings();
    let candidates = await election.getCandidates();
    let strCandidates = candidates.map((c) => toAscii(c))
    let intResults = results.map((r) => r.toNumber())
    let candidateCounts = await election.getCandidateCounts()

    
  })
});


var toAscii = function(hex) {
  var str = '',
      i = 0,
      l = hex.length;
  if (hex.substring(0, 2) === '0x') {
      i = 2;
  }
  for (; i < l; i+=2) {
      var code = parseInt(hex.substr(i, 2), 16);
      if (code === 0) continue; // this is added
      str += String.fromCharCode(code);
  }
  return str;
};
