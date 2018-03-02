pragma solidity ^0.4.16;

/// @title Voting with delegation.
contract Ballot {
    // Number of candidates per ballet
    uint constant NUMBER_OF_CANDIDATES = 11;
    // Number of total ballots
    uint constant NUMBER_OF_BALLETS = 4;

    // This declares a new complex type which will
    // be used for variables later.
    // It will represent a single voter.
    struct Voter {
        uint weight; // weight is accumulated by delegation
        bool voted;  // if true, that person already voted
        address delegate; // person delegated to
        uint vote;   // index of the voted proposal
    }

    // This is a type for a single proposal.
    struct Proposal {
        bytes32 name;   // short name (up to 32 bytes)
        uint voteCount; // number of accumulated votes
    }
    struct Election {
        Proposal[NUMBER_OF_CANDIDATES] candidates;
        uint winner;
        uint endDate;
    }

    address public chairperson;

    // This declares a state variable that
    // stores a `Voter` struct for each possible address.
    mapping(address => Voter) public voters;
    // Array representing our current election
    Election[NUMBER_OF_BALLETS] public ballots;
    
    // A dynamically-sized array of `Proposal` structs.
    Proposal[NUMBER_OF_CANDIDATES] public proposals;

    Proposal[NUMBER_OF_CANDIDATES] public presProposals;
    Proposal[NUMBER_OF_CANDIDATES] public vpProposals;
    Proposal[NUMBER_OF_CANDIDATES] public secProposals;
    Proposal[NUMBER_OF_CANDIDATES] public tresProposals;

    // TODO: Remove PROPOSALNAMES
    /// Create a new ballot to choose one of `proposalNames`.
    function Ballot(bytes32[] proposalNames, bytes32[] presNames, bytes32[] vpNames, bytes32[] secNames, bytes32[] tresNames) public {
        require(
            presNames.length < NUMBER_OF_CANDIDATES &&
            vpNames.length < NUMBER_OF_CANDIDATES &&
            secNames.length < NUMBER_OF_CANDIDATES &&
            tresNames.length < NUMBER_OF_CANDIDATES
        );
        chairperson = msg.sender;
        voters[chairperson].weight = 1;
        uint i = 0;

        // For each of the provided proposal names,
        // create a new proposal object and add it
        // to the end of the array.
        for (i = 0; i < proposalNames.length; i++) {
            // `Proposal({...})` creates a temporary
            // Proposal object and `proposals.push(...)`
            // appends it to the end of `proposals`.
            proposals[i] = Proposal({
                name: proposalNames[i],
                voteCount: 0
            });
        }
        // Fill our president proposal array
        for (i = 0; i < presNames.length; i++) {
            presProposals[i] = Proposal({
                name: presNames[i],
                voteCount: 0
            });
        }
        // Fill our vp proposal array
        for (i = 0; i < vpNames.length; i++) {
            vpProposals[i] = Proposal({
                name: vpNames[i],
                voteCount: 0
            });
        }
        // Fill our sec proposal array
        for (i = 0; i < secNames.length; i++) {
            secProposals[i] = Proposal({
                name: secNames[i],
                voteCount: 0
            });
        }
        // Fill our tres proposal array
        for (i = 0; i < tresNames.length; i++) {
            tresProposals[i] = Proposal({
                name: tresNames[i],
                voteCount: 0
            });
        }
    }

    // Give `voter` the right to vote on this ballot.
    // May only be called by `chairperson`.
    function giveRightToVote(address voter) public {
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
    function delegate(address to) public {
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
            proposals[delegate_.vote].voteCount += sender.weight;
        } else {
            // If the delegate did not vote yet,
            // add to her weight.
            delegate_.weight += sender.weight;
        }
    }

    /// Give your vote (including votes delegated to you)
    /// to proposal `proposals[proposal].name`.
    function vote(uint proposal) public {
        Voter storage sender = voters[msg.sender];
        require(!sender.voted);
        sender.voted = true;
        sender.vote = proposal;

        // If `proposal` is out of the range of the array,
        // this will throw automatically and revert all
        // changes.
        proposals[proposal].voteCount += sender.weight;
    }

    /// @dev Computes the winning proposal taking all
    /// previous votes into account.
    function winningProposal() public view
            returns (uint winningProposal_)
    {
        uint winningVoteCount = 0;
        for (uint p = 0; p < proposals.length; p++) {
            if (proposals[p].voteCount > winningVoteCount) {
                winningVoteCount = proposals[p].voteCount;
                winningProposal_ = p;
            }
        }
    }
    function ballots() public view returns (Proposal[NUMBER_OF_CANDIDATES]){
        return proposals;
    }
    // Calls winningProposal() function to get the index
    // of the winner contained in the proposals array and then
    // returns the name of the winner
    function winnerName() public view
            returns (bytes32 winnerName_)
    {
        winnerName_ = proposals[winningProposal()].name;
    }
}

