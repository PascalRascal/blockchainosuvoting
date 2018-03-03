var Election = artifacts.require("./Election.sol");
async function foo() {
  
}

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
    await election.giveRightToVote(accounts[1], {from: accounts[0]})\

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
    assert.isTrue(didVote)
  })
});
