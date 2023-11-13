global.PropTypes = require( 'prop-types' );
global.React = require( 'react' );
global.ReactDOM = require( 'react-dom' );
global.react = global.React;
global[ 'react-dom' ] = global.ReactDOM;
global.__ = ( text ) => text;
global.$e = {
	modules: {
		CommandInternalBase: class CommandInternalBase {},
	},
};

// Base ModuleMock
function ModuleMock() {
	this.__construct = jest.fn();
	this.getDefaultSettings = jest.fn();
	this.getConstructorID = jest.fn();
}

// Assign extend as static method on ModuleMock
ModuleMock.extend = function( properties ) {
	// Create Child Mock Constructor
	function ChildModuleMock() {
		ModuleMock.call( this );
		Object.assign( this, properties );
	}

	// Set up inheritance - inherit prototype
	ChildModuleMock.prototype = Object.create( ModuleMock.prototype );
	ChildModuleMock.prototype.constructor = ChildModuleMock;

	// Copy static methods
	Object.assign( ChildModuleMock, ModuleMock );

	return ChildModuleMock;
};

global.elementorModules = {
	Module: ModuleMock,
};
