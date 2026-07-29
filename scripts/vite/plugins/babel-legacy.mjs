import { transformAsync } from '@babel/core';

import { ROOT } from '../shared/paths.mjs';

const FIRST_PARTY_JS = /\.jsx?$/;

/**
 * Virtual modules must be left alone. Rolldown's own runtime is a synthetic `.js` module inside the
 * project, and lowering it would turn its hoisted helper declarations into `var` assignments that
 * the bundle preamble already calls.
 */
function isFirstPartySource( id ) {
	if ( id.startsWith( '\0' ) || id.includes( 'node_modules' ) || id.includes( 'rolldown' ) ) {
		return false;
	}

	const path = id.split( '?' )[ 0 ];

	return FIRST_PARTY_JS.test( path ) && path.startsWith( ROOT );
}

/**
 * Lowers first-party source to ES5.
 *
 * Rolldown refuses any target below ES2015, but the Backbone and Marionette layers of this
 * codebase depend on the ES5 downlevel the Babel pipeline performed: Backbone invokes object
 * literal members such as `Collection#model` and `Region#constructor` with `new` and reads
 * `.prototype` off them, and a shorthand method has neither a `[[Construct]]` slot nor a
 * prototype. Keeping Babel for the transform stage is what makes the migration behaviour
 * preserving; the bundler still handles resolution, tree shaking and minification.
 */
export function babelLegacyPlugin( { presets, sourcemap } ) {
	return {
		name: 'elementor-babel-legacy',
		enforce: 'pre',
		async transform( code, id ) {
			if ( ! isFirstPartySource( id ) ) {
				return null;
			}

			const path = id.split( '?' )[ 0 ];

			const result = await transformAsync( code, {
				filename: path,
				root: ROOT,
				configFile: false,
				babelrc: false,
				sourceMaps: sourcemap,
				presets,
				plugins: [
					[ '@wordpress/babel-plugin-import-jsx-pragma' ],
					[ '@babel/plugin-transform-react-jsx', { pragmaFrag: 'React.Fragment' } ],
					[ '@babel/plugin-transform-runtime' ],
				],
			} );

			return { code: result.code, map: result.map ?? null };
		},
	};
}
