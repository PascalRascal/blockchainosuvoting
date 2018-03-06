import React, { Component } from 'react'
import ElectionContract from '../build/contracts/Election.json'
import getWeb3 from './utils/getWeb3'
import CandidateCard from './components/CandidateCard'
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
      electionInstance: null,
      candidateCounts: [],
      candidateNames: [],
      standings: [],
      votingWeight: 0
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
      console.log('GOT ACCOUNTS!')
      election.deployed().then((instance) => {
        electionInstance = instance
        this.setState({
          electionInstance: instance
        })
        electionInstance.votingWeightOf(accounts[0], {from: accounts[0]}).then((vw) => {
          this.setState({votingWeight: vw.toNumber()})
        })
        electionInstance.getCandidates({from: accounts[0]}).then((candidates) => {
          let stringCandidates = candidates.map((c) => this.state.web3.toAscii(c))
          console.log(stringCandidates)
          this.setState({
            candidateNames: stringCandidates
          })
        })
        electionInstance.getStandings({from: accounts[0]}).then((standings) => {
          let numberStandings = standings.map((c) => c.toNumber())
          console.log(numberStandings)
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

  render() {
    let {votingWeight, candidateNames, standings, candidateCounts} = this.state;
    let ballots = [];
    let candidateIndex = 0;


    if(candidateNames.length > 0 && standings.length > 0 && candidateCounts.length > 0){
      candidateCounts.forEach((count) => {
        let ballotCandidates = [];
        for(var i = 0; i < count; i++){
          ballotCandidates.push({name: candidateNames[candidateIndex], votes: standings[candidateIndex]})
          candidateIndex++;
        }
        ballots.push(ballotCandidates)
      })
      console.log(ballots);
    }


    return (
      <div className="App">
        <nav className="navbar pure-menu pure-menu-horizontal">
            <a href="#" className="pure-menu-heading pure-menu-link">{votingWeight}</a>
        </nav>

        <main className="container">
          <div className="pure-g">
            <div className="pure-u-1-1">
              <h1>President Candidates</h1>
              <div> <CandidateCard/> </div>
              <h1>Vice President Candidates</h1>
            </div>
          </div>
        </main>
      </div>
    );
  }
}

export default App
