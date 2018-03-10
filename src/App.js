import React, { Component } from 'react'
import ElectionContract from '../build/contracts/Election.json'
import getWeb3 from './utils/getWeb3'
import CandidateRow from './components/CandidateCard'
import './css/oswald.css'
import './css/open-sans.css'
import './css/pure-min.css'
import './App.css'

class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      storageValue: 0,
      web3: null,
      account: null,
      electionInstance: null,
      candidateCounts: [],
      candidateNames: [],
      standings: [],
      readyToSubmit: false,
      userBallot: [0,0,0,0],
      votingWeight: 0,
      voteSubmitted: false,
    }
  }

  componentWillMount() {
    // Get network provider and web3 instance.
    // See utils/getWeb3 for more info.

    getWeb3
    .then(results => {
      this.setState({
        web3: results.web3
      })

      // Instantiate contract once web3 provided.
      this.instantiateContract()
    })
    .catch(() => {
      console.log('Error finding web3.')
    })
  }

  instantiateContract() {
    /*
     * SMART CONTRACT EXAMPLE
     *
     * Normally these functions would be called in the context of a
     * state management library, but for convenience I've placed them here.
     */

    const contract = require('truffle-contract')
    const election = contract(ElectionContract)
    election.setProvider(this.state.web3.currentProvider)

    // Declaring this for later so we can chain functions on SimpleStorage.
    var electionInstance;
    console.log('got em')
    // Get accounts.
    this.state.web3.eth.getAccounts((error, accounts) => {
      election.deployed().then((instance) => {
        electionInstance = instance
        this.setState({
          electionInstance: instance,
          account: accounts[0]
        })
        // Set up the initial state of our app from the ethereum blockchain
        electionInstance.votingWeightOf(accounts[0], {from: accounts[0]}).then((vw) => {
          this.setState({votingWeight: vw.toNumber()})
        })
        electionInstance.didVote(accounts[0]).then((b) => {
          this.setState({
            voteSubmitted: b
          })
        })
        electionInstance.getCandidates({from: accounts[0]}).then((candidates) => {
          let stringCandidates = candidates.map((c) => this.state.web3.toAscii(c).replace(/\u0000/g, ''))
          console.log(stringCandidates)
          this.setState({
            candidateNames: stringCandidates
          })
        })
        electionInstance.getStandings({from: accounts[0]}).then((standings) => {
          let numberStandings = standings.map((c) => c.toNumber())
          this.setState({
            standings: numberStandings
          })
        })
        electionInstance.getCandidateCounts({from: accounts[0]}).then((counts) => {
          let numberCounts = counts.map((c) => c.toNumber())
          console.log(numberCounts)
          this.setState({
            candidateCounts: numberCounts
          })
        })

      })
    })
  }
  submitVotes(){
    console.log(this.state.userBallot)
    this.state.electionInstance.castVotes(this.state.userBallot, {from: this.state.account, gas:3000000}).then(() => {
      this.setState({
        voteSubmitted: true
      })
      alert('Congrats! You Voted!')
    })
  }
  setUserBallotChoice(ballot) {
    return (candidate) => {
      
      let {userBallot} = this.state;
      userBallot[ballot] = candidate;
      if(userBallot[0] && userBallot[1] && userBallot[2] && userBallot[3]){
        this.setState({readyToSubmit: true})
      }
    }
  }

  render() {
    let {votingWeight, candidateNames, standings, candidateCounts} = this.state;
    let candidateIndex = 0;
    var ballots = null;


    if(candidateNames.length > 0 && standings.length > 0 && candidateCounts.length > 0){
      ballots = [];
      candidateCounts.forEach((count) => {
        let ballotCandidates = [];
        for(var i = 0; i < count; i++){
          ballotCandidates.push({name: candidateNames[candidateIndex], votes: standings[candidateIndex]})
          candidateIndex++;
        }
        ballots.push(ballotCandidates)
      })
    }


    return (
      <div className="App">
        <nav className="navbar pure-menu pure-menu-horizontal">
            <a href="#" className="pure-menu-heading pure-menu-link">{votingWeight}</a>
        </nav>

        <main className="container">
          <div className="pure-g">
          {ballots ? 
            <div className="pure-u-1-1">
              <h1>President Candidates</h1>
              <div> <CandidateRow onCandidateSelected={this.setUserBallotChoice(0).bind(this)}candidates={ballots[0]}/> </div>
              <h1>Vice President Candidates</h1>
              <div> <CandidateRow onCandidateSelected={this.setUserBallotChoice(1).bind(this)}candidates={ballots[1]}/> </div>
              <h1>Treasury Candidates</h1>
              <div> <CandidateRow onCandidateSelected={this.setUserBallotChoice(2).bind(this)}candidates={ballots[2]}/></div>
              <h1>Secretary Candidates</h1>
              <div> <CandidateRow onCandidateSelected={this.setUserBallotChoice(3).bind(this)}candidates={ballots[3]}/></div>
            </div>
          : <div/> 
          }
          </div>
          {this.state.readyToSubmit && !this.state.voteSubmitted ? <div> 
            <button onClick={() => this.submitVotes()} className="pure-button pure-button-primary">Submit Ballot</button>
          </div> : <div/>}
        </main>
      </div>
    );
  }
}

export default App
