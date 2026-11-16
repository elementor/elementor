import { transformAsync } from '@babel/core';
import { transform } from 'esbuild';

import { ROOT } from '../shared/paths.mjs';

const TYPESCRIPT_SOURCE = /\.[jt]sx?$/;

/**
 * Packages built from a prebuilt `dist` are already transpiled, so they are left untouched.
 */
const PREBUILT_DIST = /[\\/]packages[\\/](?:packages[\\/](?:core|libs)|apps)[\\/][^\\/]+[\\/]dist[\\/]/;

function isPackageSource( id ) {
	if ( id.startsWith( '\0' ) || id.includes( 'node_modules' ) || PREBUILT_DIST.test( id ) ) {
		return false;
	}

	const path = id.split( '?' )[ 0 ];

	return TYPESCRIPT_SOURCE.test( path ) && path.startsWith( ROOT );
}

/**
 * Unlike the base bundles, the packages need only type stripping and JSX compilation with no
 * downlevel, so esbuild produces equivalent output far more cheaply than Babel would.
 */
export function typescriptPlugin() {
	return {
		name: 'elementor-packages-typescript',
		enforce: 'pre',
		async transform( code, id ) {
			if ( ! isPackageSource( id ) ) {
				return null;
			}

			const path = id.split( '?' )[ 0 ];

			const result = await transform( code, {
				loader: path.endsWith( 'x' ) ? 'tsx' : 'ts',
				// `@babel/preset-react` 7.x still defaults to the classic runtime, and the packages
				// rely on it: `React` resolves to the external global rather than to a bundled
				// `react/jsx-runtime`. The automatic runtime also changes how an array child is
				// keyed, which React reports as a missing `key` warning.
				jsx: 'transform',
				jsxFactory: 'React.createElement',
				jsxFragment: 'React.Fragment',
				sourcefile: path,
				sourcemap: true,
				target: 'es2020',
			} );

			return { code: result.code, map: result.map };
		},
	};
}

/**
 * Emotion's Babel plugin generates the readable `css-<label>` class names that make dev builds
 * debuggable. It has no production counterpart, matching the Webpack config where it was added
 * only to the development rule.
 */
export function emotionBabelPlugin() {
	return {
		name: 'elementor-packages-emotion',
		async transform( code, id ) {
			if ( ! isPackageSource( id ) ) {
				return null;
			}

			const path = id.split( '?' )[ 0 ];

			const result = await transformAsync( code, {
				filename: path,
				root: ROOT,
				configFile: false,
				babelrc: false,
				sourceMaps: true,
				plugins: [
					[ '@emotion/babel-plugin', { autoLabel: 'dev-only', labelFormat: '[local]' } ],
				],
			} );

			return { code: result.code, map: result.map ?? null };
		},
	};
}
