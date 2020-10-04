'use strict';

var JSToCssPlugin = (function () {
	const path = require('path');
	const fs = require('fs');
	const variants = require( '../core/app/assets/_styles/variants/index.js' );
	let css = '';

	function JSToCssPlugin() {
		const filePath = path.resolve( __dirname, '../assets/dev/scss/app/e-style.scss' );

		console.log( '------------------------------------------------' );
		console.log( 'variants', variants );
		console.log( '------------------------------------------------' );

		fs.writeFileSync(filePath, processJS( variants ), (err) => { if (err) throw err; });
	}

	function processJS( obj, prevProp ) {
		for ( const key in obj ) {
			const value = obj[ key ];

			if ( 'string' === typeof value ) {
				css += key + ': ' + value + ';';
			} else {
				css += prevProp ? '&--' + key + ' {' : '.' + key + ' {';
				processJS( value, key );
				css += ' } ';
			}
		}

		return css;
	}

	JSToCssPlugin.prototype.apply = function ( compiler ) {

	};

	return JSToCssPlugin;
})();

module.exports = JSToCssPlugin;
