import '@testing-library/jest-dom/extend-expect';

global.PropTypes = require( 'prop-types' );
global.React = require( 'react' );
global.ReactDOM = require( 'react-dom' );
global.react = global.React;
global[ 'react-dom' ] = global.ReactDOM;
global.__ = ( text ) => text;
