import React, { Component } from 'react'

class CandidateRow extends Component {
    constructor(props){
        super(props)
        this.state = {
            selectedCandidate: null
        }
    }
    candidateSelected(candidate) {
        console.log('CANDIDATE SELECTED!')
        this.setState({selectedCandidate: candidate})
        this.props.onCandidateSelected(candidate)
    }
    render() {
        let {candidates} = this.props
        return(
            <div style={{
                display: "flex",
                flexDirection: 'row'
            }}>
                {candidates ? candidates.map((candidate,i) => (
                    <div style={{marginRight: "50px"}} key={i}>
                        <h3> {candidate.name} </h3>
                        <p> Votes: {candidate.votes + (i === (this.state.selectedCandidate - 1)) ? 1 : 0}  </p>
                        <button onClick={() => this.candidateSelected(i+1)} className="pure-button pure-button-primary">Vote</button>
                    </div>
                )) : null}
            </div>
        )
    }
}

export default CandidateRow