/* container which maps state and dispatches to its props 
  so it can be referenced in the VoteButtons component */

const { connect } = require('react-redux');
const actions = require('../actions');
const VoteButtons = require('../components/VoteButtons');

const mapStateToProps = function(state) {
  return {
    voteScore: state.voteScore,
    voteCount: state.voteCount
  }
}

const mapDispatchToProps = function(dispatch) {
  return {
    onUpvote: function() {
      dispatch(actions.upvote())
    },
    onDownvote: function() {
      dispatch(actions.downvote())
    }
  }
}

const VoteContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(VoteButtons);

module.exports = VoteContainer;