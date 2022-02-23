const React = require('react');
const Link = require('react-router-dom').Link;
const VoteContainer = require('../containers/VoteContainer');

/* the main page for the about route of this app */
const About = function() {
  return (
    <div>
      <h1>About</h1>

      <p>This is a starter react app use react-redux to manage state - try rating this app below to see it in action!</p>

      <VoteContainer label="Upvote or downvote this app!"/>

      <Link to='/'>Go home</Link>
    </div>
  );
}

module.exports = About;