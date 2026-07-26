import { BASE_EXTERNALS, resolveBracketGlobal } from '../shared/externals.mjs';

const IIFE_BODY_PATTERN = /^([\s\S]*?\(function\s*\([^)]*\)\s*\{)/;

const REQUIRE_GLOBALS = {
	...Object.fromEntries(
		Object.entries( BASE_EXTERNALS ).map( ( [ id, global ] ) => [ id, resolveBracketGlobal( global ) ] ),
	),
	'prop-types': 'PropTypes',
	'@reduxjs/toolkit': 'elementorVendors.reduxToolkit',
	'react-redux': 'elementorVendors.reactRedux',
};

function buildRequireShim() {
	const staticCases = Object.entries( REQUIRE_GLOBALS )
		.map( ( [ id, expression ] ) => `case ${ JSON.stringify( id ) }:return ${ expression };` )
		.join( '' );

	return [
		'var require=function(id){',
		`switch(id){${ staticCases }`,
		'default:',
		'if(id.indexOf("@wordpress/")===0){',
		'var wpKey=id.slice(12).replace(/-([a-z])/g,function(_,c){return c.toUpperCase();});',
		'if(typeof wp!=="undefined"&&wp[wpKey])return wp[wpKey];',
		'}',
		'var elMatch=id.match(/^@elementor\\/(ui|icons)\\/(.+)$/);',
		'if(elMatch){return elementorV2[elMatch[1]][elMatch[2]];}',
		'throw new Error(\'Dynamic require of "\'+id+\'" is not supported\');',
		'}',
		'};',
	].join( '' );
}

const REQUIRE_SHIM = buildRequireShim();

function injectRequireShim( code ) {
	if ( ! /\brequire\s*\(\s*['"]/.test( code ) ) {
		return code;
	}

	const match = code.match( IIFE_BODY_PATTERN );

	if ( ! match ) {
		return code;
	}

	return `${ match[ 1 ] }${ REQUIRE_SHIM }${ code.slice( match[ 1 ].length ) }`;
}

export function cjsRequireInteropPlugin() {
	return {
		name: 'cjs-require-interop',
		generateBundle( _, bundle ) {
			for ( const chunk of Object.values( bundle ) ) {
				if ( chunk.type !== 'chunk' || ! chunk.fileName.endsWith( '.js' ) ) {
					continue;
				}

				chunk.code = injectRequireShim( chunk.code );
			}
		},
	};
}
