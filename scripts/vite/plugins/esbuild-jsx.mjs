import { transformSync } from 'esbuild';

const JS_EXTENSION_PATTERN = /\.[cm]?jsx?$/;

export function esbuildJsxPlugin( { isProduction = false } = {} ) {
	return {
		name: 'esbuild-jsx',
		enforce: 'pre',
		transform( code, id ) {
			const filename = id.split( '?' )[ 0 ];

			if ( ! JS_EXTENSION_PATTERN.test( filename ) || filename.includes( 'node_modules' ) ) {
				return null;
			}

			if ( ! code.includes( '<' ) ) {
				return null;
			}

			const result = transformSync( code, {
				loader: filename.endsWith( '.ts' ) || filename.endsWith( '.tsx' ) ? 'tsx' : 'jsx',
				jsx: 'transform',
				jsxFactory: 'React.createElement',
				jsxFragment: 'React.Fragment',
				sourcefile: filename,
				sourcemap: ! isProduction,
				legalComments: isProduction ? 'none' : 'inline',
				target: 'es2015',
			} );

			return {
				code: result.code,
				map: result.map || null,
			};
		},
	};
}
