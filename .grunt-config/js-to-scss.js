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
			const value = obj[ key ],
				prefix = '.eps-',
				connector = prevSelector && prevSelector.indexOf( prefix ) > -1 ? '&--' : '&-';

			if ( 'string' === typeof value ) {
				if ( key === 'default' ) {
					css += value;
				} else {
					css += connector + key + ' {' + value + '}\n';
				}
			} else {
				key = pascalCaseToDashCase( key );

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
				css+= '}\n';
			}
		}

		return css;
	}

	JsToScssPlugin.prototype.apply = function ( compiler ) {

	};

	return JsToScssPlugin;
})();

module.exports = JsToScssPlugin;
