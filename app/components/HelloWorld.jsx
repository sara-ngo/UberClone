const React = require('react');
const Link = require('react-router-dom').Link
const UnorderedList = require('./UnorderedList');
const About = require('./About');
const VoteContainer = require('../containers/VoteContainer');

const dependenciesArray = [
  'express - middleware for the node server',
  'react - for generating the views of the app',
  'react-dom - powers the rendering of elements to the DOM, typically paired with React',
  'webpack - for bundling all the javascript',
  'webpack-cli - command line support for webpack',
  'jsx-loader - allows webpack to load jsx files',
  'react-router-dom - handles routing!',
  'redux - handles state!',
  'react-redux - react bindings for using redux'
];

const componentsMade = [
  'HelloWorld - which is the view you are seeing now',
  'UnorderedList - which takes an array of "items" and returns a <ul> element with <li>, elements of each of those items within it',
  'About - text content to show when "about" route is accessed',
  'VoteButtons - buttons to rate the app up or down',
  'VoteContainer - container that connects the redux state to the VoteButtons component so you can see total score and count updated',
];

/* the main page for the index route of this app */
const HelloWorld = function() {
  return (
    <div>
      <h1>Hello World!</h1>

      <Link to='/about'>Read about and Rate this app!</Link>

      <p>This is a starter <a href="http://glitch.com">Glitch</a> app for React! 
        It uses only a few dependencies to get you started on working with 
        state handling via Redux:</p>

      <UnorderedList items={dependenciesArray} />

      <p>Look in <code>app/components/</code> for {componentsMade.length} example components:</p>

      <UnorderedList items={componentsMade} />
      
      <VoteContainer label="Upvote or downvote this app!"/>
    </div>
  );
};

module.exports = HelloWorld;