'use strict';

var JsToScssPlugin = (function () {
	const path = require('path');
	const fs = require('fs');
	let css = '';

	function pascalCaseToDashCase( str ) {
		return ( str.charAt( 0 ).toLowerCase() + str.slice( 1 ) ).replace( /([A-Z])/g, ( _, char ) => '-' + char.toLowerCase() );
	}

	function JsToScssPlugin( { jsSourcePath, scssDestination } ) {
		const variants = require( jsSourcePath ),
			filePath = path.resolve( __dirname, scssDestination );

		parseVariants( variants );

		fs.writeFileSync(filePath, css, (err) => { if (err) throw err; });
	}

	function parseVariants( variants ) {
		for ( const key in variants ) {
			parseJS( variants[ key ] );
		}
	}

	function parseJS( obj, prevKey, prevSelector ) {
		for ( let key in obj ) {
			const value = obj[ key ];

			if ( 'object' !== typeof value ) {
				css += key + ': ' + value + ';';
			} else {
				if ( key.indexOf( '@media' ) > -1 ) {
					css += key + ' {';
					parseJS( value );
					css += ' } ';
				} else {
					key = pascalCaseToDashCase( key );

					const prefix = '.eps-';
					const connector = prevSelector && prevSelector.indexOf( prefix ) > -1 ? '&--' : '&-';

					let selector = '';

					// prevKey.substr is mainly for .dark prefix class
					// TODO: make better detection when there is a class or an attribute target as prevKey
					if ( prevKey && prevKey.substr( 0, 1 ) !== '.' && prevKey.substr( 0, 1 ) !== '[' && prevKey.substr( 0, 1 ) !== ':' ) {
						selector = ( key.indexOf( '&' ) === -1 ) ? connector + key : key;
					} else {
						selector = key.substr( 0, 1 ) === '.' || key.substr( 0, 1 ) === '[' || key.substr( 0, 1 ) === ':' ? key : prefix + key;
					}

					css += selector + ' {';
					parseJS( value, key, selector );
					css += ' } ';
				}
			}
		}

		return css;
	}

	JsToScssPlugin.prototype.apply = function ( compiler ) {

	};

	return JsToScssPlugin;
})();

module.exports = JsToScssPlugin;
