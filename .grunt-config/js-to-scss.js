'use strict';

var JsToScssPlugin = (function () {
	const path = require('path');
	const fs = require('fs');
	const variants = require( '../core/app/assets/_styles/variants/index.js' );
	let css = '';

	function pascalCaseToDashCase( str ) {
		return ( str.charAt( 0 ).toLowerCase() + str.slice( 1 ) ).replace( /([A-Z])/g, ( _, char ) => '-' + char.toLowerCase() );
	}

	function JsToScssPlugin() {
		const filePath = path.resolve( __dirname, '../assets/dev/scss/app/e-style.scss' );

		fs.writeFileSync(filePath, processJS( variants ), (err) => { if (err) throw err; });
	}

	function processJS( obj, prevKey, prevSelector ) {
		for ( let key in obj ) {
			const value = obj[ key ];

			if ( 'string' === typeof value ) {
				css += key + ': ' + value + ';';
			} else {
				key = pascalCaseToDashCase( key );

				const prefix = '.eps-';
				const connector = prevSelector && prevSelector.indexOf( 'eps' ) > -1 ? '&--' : '&-';
				const selector = prevKey ? connector + key : prefix + key;

				css += selector + ' {';
				processJS( value, key, selector );
				css += ' } ';
			}
		}

		return css;
	}

	JsToScssPlugin.prototype.apply = function ( compiler ) {

	};

	return JsToScssPlugin;
})();

module.exports = JsToScssPlugin;
