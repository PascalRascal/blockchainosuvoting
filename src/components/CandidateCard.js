import React, { Component } from 'react'

class CandidateRow extends Component {
    constructor(props){
        super(props)
        this.state = {
            selectedCandidate: null
        }
    }

    render() {
        let {candidates} = this.props
    }
}

class CandidateCard extends Component {
    render () {
        return (
        <div className="pure-g">
            <div className="pure-u-1-3"><p>Thirds</p></div>
            <div className="pure-u-1-3"><p>Thirds</p></div>
            <div className="pure-u-1-3"><button className="pure-button pure-button-primary">A Primary Button</button>
        </div>
        </div>
        )
    }
}

export default CandidateCard