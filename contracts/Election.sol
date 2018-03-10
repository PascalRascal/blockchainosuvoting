pragma solidity ^0.4.16;

/// @title Voting with delegation.
contract Election {
    // Number of candidates per ballet
    uint8 constant NUMBER_OF_CANDIDATES = 3;
    // Number of total ballots
    uint8 constant NUMBER_OF_BALLOTS = 4;
     
    // This declares a new complex type which will
    // be used for variables later.
    // It will represent a single voter.
    struct Voter {
        uint8 weight; // weight is accumulated by delegation
        bool voted;  // if true, that person already voted
        address delegate; // person delegated to
        uint vote;   // index of the voted proposal
        uint8[NUMBER_OF_BALLOTS] votes; // The voter's submitted votes
    }

    // This is a type for a single proposal.
    struct Proposal {
        bytes32 name;   // short name (up to 32 bytes)
        uint8 voteCount; // number of accumulated votes
    }
    // Struct for a ballot, in which a proposal is voted on
    struct Ballot {
        Proposal[NUMBER_OF_CANDIDATES] candidates;
        uint8 numberOfCandidates;
    }

    address public chairperson;
    uint public startTime;
    // This declares a state variable that
    // stores a `Voter` struct for each possible address.
    mapping(address => Voter) public voters;
    // Array representing our current election
    Ballot[NUMBER_OF_BALLOTS] ballots;
    

    /// Create a new ballot to choose one of `proposalNames`.
    /// NOTE: Solidity is SHIT AND doesnt do nested arrays, so we have to be creative with our solution
    /// Candidates is an array containg our candidate names eg ["Satoshi", "Vitalik"]
    /// Candidates per ballot tells us which indices correspond the the ballot like, [1, 2] tells us the first 1 strings refer to a ballot, the next 2 refer to another ballot, and so on
    function Election(bytes32[NUMBER_OF_BALLOTS * NUMBER_OF_CANDIDATES] candidates, uint8[NUMBER_OF_BALLOTS] candidatesPerBallot) public {
        require(
            candidates.length <= (NUMBER_OF_BALLOTS * NUMBER_OF_CANDIDATES)
        );
        chairperson = msg.sender;
        voters[chairperson].weight = 1;
        startTime = block.timestamp;
        uint8 candidateIndex = 0;
        // TEST THIS
        for (uint8 i = 0; i < NUMBER_OF_BALLOTS; i++) {
            ballots[i].numberOfCandidates = candidatesPerBallot[i];
            for (uint8 j = 0; j < candidatesPerBallot[i]; j++) {
                
                ballots[i].candidates[j] = Proposal({
                    name: candidates[candidateIndex],
                    voteCount: 0 
                });
                candidateIndex++;
                
            }
        }
        
    }

    modifier timeConstrained() {
        require(block.timestamp < startTime + 5 days);
        _;
    }

    // Give `voter` the right to vote on this ballot.
    // May only be called by `chairperson`.
    function giveRightToVote(address voter) public timeConstrained {
        // If the argument of `require` evaluates to `false`,
        // it terminates and reverts all changes to
        // the state and to Ether balances. It is often
        // a good idea to use this if functions are
        // called incorrectly. But watch out, this
        // will currently also consume all provided gas
        // (this is planned to change in the future).
        require(
            (msg.sender == chairperson) && 
            !voters[voter].voted &&
            (voters[voter].weight == 0)
        );
        voters[voter].weight = 1;
    }

    /// Delegate your vote to the voter `to`.
    function delegate(address to) public timeConstrained {
        // assigns reference
        Voter storage sender = voters[msg.sender];
        require(!sender.voted);

        // Self-delegation is not allowed.
        require(to != msg.sender);

        // Forward the delegation as long as
        // `to` also delegated.
        // In general, such loops are very dangerous,
        // because if they run too long, they might
        // need more gas than is available in a block.
        // In this case, the delegation will not be executed,
        // but in other situations, such loops might
        // cause a contract to get "stuck" completely.
        while (voters[to].delegate != address(0)) {
            to = voters[to].delegate;

            // We found a loop in the delegation, not allowed.
            require(to != msg.sender);
        }

        // Since `sender` is a reference, this
        // modifies `voters[msg.sender].voted`
        sender.voted = true;
        sender.delegate = to;
        Voter storage delegate_ = voters[to];
        if (delegate_.voted) {
            // If the delegate already voted,
            // directly add to the number of votes
            for (uint i = 0; i < NUMBER_OF_BALLOTS; i++) {
                uint choice = delegate_.votes[i];
                // Don't count empty votes
                if (choice != 0) {
                    ballots[i].candidates[choice - 1].voteCount += sender.weight;
                }
            }
        } else {
            // If the delegate did not vote yet,
            // add to her weight.
            delegate_.weight += sender.weight;
        }
    }

    /// Cast your ballot for the election
    /// IMPORTANT: The choice is the index+1 of the candidate they support (0 is a no vote)
    function castVotes(uint8[NUMBER_OF_BALLOTS] choices) public timeConstrained {
        Voter storage sender = voters[msg.sender];
        require(!sender.voted);
        sender.voted = true;
        sender.votes = choices;
        for (uint8 i = 0; i < NUMBER_OF_BALLOTS; i++) {
            uint8 choice = choices[i];
            require(choice <= ballots[i].numberOfCandidates);
            if (choice > 0) {
                ballots[i].candidates[choice - 1].voteCount += sender.weight;
            }
        }
        
    }

    function votingWeightOf(address _voter) public view returns (uint8 weight) { 
        weight = voters[_voter].weight;
    }

    function didVote(address _voter) public view returns (bool voted) {
        voted = voters[_voter].voted;
    }

    function getVotes(address _voter) public view returns (uint8[NUMBER_OF_BALLOTS] votes) {
        require(voters[_voter].voted);
        votes = voters[_voter].votes;
    }

    function getCandidates() public view returns (bytes32[NUMBER_OF_BALLOTS * NUMBER_OF_CANDIDATES] candidates) {
        uint8 candidateIndex = 0;
        for (uint i = 0; i < NUMBER_OF_BALLOTS; i++) {
            for (uint j = 0; j < ballots[i].numberOfCandidates; j++) {
                candidates[candidateIndex] = ballots[i].candidates[j].name;
                candidateIndex++;
            }
        }
    }
    function getStandings() public view returns (uint8[NUMBER_OF_BALLOTS * NUMBER_OF_CANDIDATES] standings) {
        uint8 candidateIndex = 0;
        for (uint8 i = 0; i < NUMBER_OF_BALLOTS; i++) { 
            for (uint8 j = 0; j < ballots[i].numberOfCandidates; j++) {
                standings[candidateIndex] = ballots[i].candidates[j].voteCount;
                candidateIndex++;
            }
        }
        return standings;
    }

    function getCandidateCounts() public view returns (uint8[NUMBER_OF_BALLOTS] candidateCounts) {
        for (uint8 i = 0; i < NUMBER_OF_BALLOTS; i++) {
            candidateCounts[i] = ballots[i].numberOfCandidates;
        }
    }
}

