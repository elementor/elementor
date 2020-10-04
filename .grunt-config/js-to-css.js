'use strict';

var JSToCssPlugin = (function () {
	const path = require('path');
	const fs = require('fs');
	const variants = require( '../core/app/assets/_styles/variants/index.js' );
	let css = '';

	function pascalCaseToDashCase( str ) {
		return ( str.charAt( 0 ).toLowerCase() + str.slice( 1 ) ).replace( /([A-Z])/g, ( _, char ) => '-' + char.toLowerCase() );
	}

	function JSToCssPlugin() {
		const filePath = path.resolve( __dirname, '../assets/dev/scss/app/e-style.scss' );

		fs.writeFileSync(filePath, processJS( variants ), (err) => { if (err) throw err; });
	}

	function processJS( obj, prevProp ) {
		for ( let key in obj ) {
			const value = obj[ key ];

			if ( 'string' === typeof value ) {
				css += key + ': ' + value + ';';
			} else {
				key = pascalCaseToDashCase( key );

				css += prevProp ? '&--' + key + ' {' : '.eps-' + key + ' {';
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
