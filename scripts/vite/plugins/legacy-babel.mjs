import { transformSync } from '@babel/core';

const JS_EXTENSION_PATTERN = /\.[cm]?jsx?$/;
const CLASS_DECLARATION_PATTERN = /\bclass\s+(?:extends|[\w$])/;
const MARIONETTE_EXTEND_PATTERN = /\.extend\s*\(\s*\{/;
const LEGACY_TRANSPILE_PATTERN = new RegExp(
	`${ CLASS_DECLARATION_PATTERN.source }|${ MARIONETTE_EXTEND_PATTERN.source }`,
);

const LEGACY_SOURCE_SEGMENTS = [
	'/assets/dev/',
	'/core/common/',
	'/core/editor/',
	'/core/kits/',
	'/app/assets/',
	'/modules/',
];

const EXCLUDED_SEGMENTS = [
	'/node_modules/',
	'/packages/',
	'/scripts/vite/shims/',
];

const LEGACY_BABEL_OPTIONS = {
	targets: { ie: '11' },
	presets: [
		[
			'@babel/preset-env',
			{
				modules: false,
				loose: true,
				bugfixes: false,
			},
		],
	],
	sourceMaps: false,
};

function normalizePath( filePath ) {
	return filePath.split( '?' )[ 0 ].replace( /\\/g, '/' );
}

function isLegacySource( filePath ) {
	if ( ! JS_EXTENSION_PATTERN.test( filePath ) ) {
		return false;
	}

	if ( EXCLUDED_SEGMENTS.some( ( segment ) => filePath.includes( segment ) ) ) {
		return false;
	}

	return LEGACY_SOURCE_SEGMENTS.some( ( segment ) => filePath.includes( segment ) );
}

function transpileWithBabel( code, options ) {
	const result = transformSync( code, options );

	return result?.code ?? code;
}

export function legacyBabelPlugin() {
	return {
		name: 'legacy-babel',
		enforce: 'pre',
		transform( code, id ) {
			const filePath = normalizePath( id );

			if ( ! isLegacySource( filePath ) || ! LEGACY_TRANSPILE_PATTERN.test( code ) ) {
				return null;
			}

			return {
				code: transpileWithBabel( code, {
					filename: filePath,
					...LEGACY_BABEL_OPTIONS,
				} ),
				map: null,
			};
		},
	};
}
