'use strict';

var JSToCssPlugin = (function () {
	const write = require('write');
	const path = require('path');
	const styled = require( '../assets/js/styled.min.js' );

	function JSToCssPlugin(options) {
		if (options === void 0) {
			//throw new Error(`Please provide 'options' for the JSToCssPlugin config`);
		}

		console.log( '----------------------- JS TO CSS' );
		console.log( styled );
		console.log( '----------------------- JS TO CSS - END' );

		//this.options = options;
	}

	JSToCssPlugin.prototype.apply = function ( compiler ) {

	};

	return JSToCssPlugin;
})();

module.exports = JSToCssPlugin;
