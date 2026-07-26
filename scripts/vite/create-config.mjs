import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, build as viteBuild } from 'vite-plus';

import { getBannerText } from './shared/banner.mjs';
import {
	createExternalResolver,
	isExternalModule,
	isPackageExternal,
	PACKAGES_EXTERNAL_MAP,
	resolvePackageGlobal,
} from './shared/externals.mjs';
import {
	CHUNKED_BASE_ENTRIES,
	FRONTEND_ENTRIES,
	SIMPLE_BASE_ENTRIES,
	getPackageEntries,
	withProductionSuffix,
} from './shared/entries.mjs';
import { loadAliases, ROOT, resolveFromRoot, VITE_JS_OUTPUT } from './shared/paths.mjs';
import {
	applyBannerPlugin,
	appendEntryInitPlugin,
	cleanChunkFiles,
	createPackagesInitInitializer,
	extractI18nStringsPlugin,
	wordpressAssetFilePlugin,
} from './plugins/build.mjs';
import { esbuildJsxPlugin } from './plugins/esbuild-jsx.mjs';
import { appScssPlugin, componentScssPlugin } from './plugins/scss.mjs';

const REACT_JSX_RUNTIME_SHIM = fileURLToPath( new URL( './shims/react-jsx-runtime.js', import.meta.url ) );
const REACT_DOM_CLIENT_SHIM = fileURLToPath( new URL( './shims/react-dom-client.js', import.meta.url ) );
const CREATE_REACT_CONTEXT_SHIM = fileURLToPath( new URL( './shims/create-react-context.js', import.meta.url ) );
const DOMPURIFY_SHIM = fileURLToPath( new URL( './shims/dompurify.js', import.meta.url ) );
const MIXPANEL_SHIM = fileURLToPath( new URL( './shims/mixpanel-browser.js', import.meta.url ) );

const JSX_RUNTIME_ALIASES = {
	'react/jsx-runtime': REACT_JSX_RUNTIME_SHIM,
	'react/jsx-dev-runtime': REACT_JSX_RUNTIME_SHIM,
	'react-dom/client': REACT_DOM_CLIENT_SHIM,
	'create-react-context': CREATE_REACT_CONTEXT_SHIM,
	dompurify: DOMPURIFY_SHIM,
	'mixpanel-browser': MIXPANEL_SHIM,
};

const SHARED_BANNER = getBannerText();

const SHARED_INJECT = {
	React: 'react',
	ReactDOM: 'react-dom',
	PropTypes: 'prop-types',
	__: [ '@wordpress/i18n', '__' ],
	sprintf: [ '@wordpress/i18n', 'sprintf' ],
};

function createBaseGlobalsResolver( additional = {} ) {
	const staticMap = createExternalResolver( additional );

	return ( id, importer ) => {
		const resolved = staticMap( id, importer );
		return resolved === false ? undefined : resolved;
	};
}

function createBaseI18nPattern( entryPath, entryName ) {
	const normalizedEntryName = entryName.replace( /\.min$/, '' );

	if ( 'editor' === normalizedEntryName ) {
		return join( resolveFromRoot( 'assets/dev/js/editor' ), '**/*.{js,jsx}' );
	}

	if ( [ 'app', 'app-packages', 'app-loader' ].includes( normalizedEntryName ) ) {
		return join( resolveFromRoot( 'app' ), '**/*.{js,jsx}' );
	}

	return join( dirname( entryPath ), '**/*.{js,jsx}' );
}

function createSharedPlugins( { isProduction, isFrontend = false, entryPath, entryName } = {} ) {
	const plugins = [
		esbuildJsxPlugin( { isProduction } ),
		appScssPlugin( { root: ROOT } ),
		componentScssPlugin(),
		applyBannerPlugin( SHARED_BANNER ),
	];

	if ( isProduction && entryPath && entryName && ! isFrontend ) {
		plugins.push(
			extractI18nStringsPlugin( {
				pattern: ( pathPrefix ) => createBaseI18nPattern( pathPrefix, entryName ),
			} ),
		);
	}

	if ( isFrontend ) {
		plugins.unshift( {
			name: 'clean-frontend-chunks',
			buildStart() {
				cleanChunkFiles( VITE_JS_OUTPUT, isProduction ? '.bundle.min.js' : '.bundle.js' );
			},
		} );
	}

	return plugins;
}

const SHARED_DEFINE = {
	'import.meta': '{}',
};

function createSharedBuildConfig( { isProduction, watch = false } = {} ) {
	return {
		sourcemap: ! isProduction,
		minify: isProduction ? 'esbuild' : false,
		target: 'es2015',
		cssMinify: false,
		watch: watch ? {} : null,
	};
}

function createStandardBuildOptions( {
	isProduction,
	watch = false,
	outDir,
	entryName,
	entryPath,
	external,
	globals,
	inject = SHARED_INJECT,
	plugins,
	entryFileNames = '[name].js',
	extraRollupOutput = {},
} ) {
	return defineConfig( {
		plugins,
		css: {
			postcss: {
				plugins: [],
			},
		},
		resolve: {
			alias: { ...JSX_RUNTIME_ALIASES, ...loadAliases() },
			extensions: [ '.js', '.jsx', '.ts', '.tsx' ],
		},
		build: {
			outDir,
			emptyOutDir: false,
			...createSharedBuildConfig( { isProduction, watch } ),
			rollupOptions: {
				input: {
					[ entryName ]: entryPath,
				},
				external,
				transform: { inject, define: SHARED_DEFINE },
				output: {
					format: 'iife',
					entryFileNames,
					inlineDynamicImports: true,
					keepNames: true,
					globals,
					...extraRollupOutput,
				},
			},
		},
	} );
}

async function runEntries( entries, createEntryConfig, { watch = false } = {} ) {
	const results = [];

	for ( const [ entryName, entryPath ] of Object.entries( entries ) ) {
		results.push( await viteBuild( createEntryConfig( entryName, entryPath ) ) );
	}

	return watch ? results : undefined;
}

export async function buildChunkedEntries( entries, isProduction, { isFrontend = false, watch = false } = {} ) {
	const external = ( id, importer ) => isExternalModule( id, importer );
	const globals = createBaseGlobalsResolver();

	return runEntries( entries, ( entryName, entryPath ) => defineConfig( {
		plugins: createSharedPlugins( { isProduction, isFrontend, entryPath, entryName } ),
		resolve: {
			alias: { ...JSX_RUNTIME_ALIASES, ...loadAliases() },
			extensions: [ '.js', '.jsx', '.ts', '.tsx' ],
		},
		build: {
			outDir: VITE_JS_OUTPUT,
			emptyOutDir: false,
			...createSharedBuildConfig( { isProduction, watch } ),
			rollupOptions: {
				input: { [ entryName ]: entryPath },
				external,
				transform: { inject: SHARED_INJECT, define: SHARED_DEFINE },
				output: {
					format: 'iife',
					entryFileNames: '[name].js',
					inlineDynamicImports: true,
					keepNames: true,
					globals,
				},
			},
		},
	} ), { watch } );
}

export async function buildBaseEntries( isProduction, { watch = false } = {} ) {
	const simpleEntries = isProduction ? withProductionSuffix( SIMPLE_BASE_ENTRIES ) : SIMPLE_BASE_ENTRIES;
	const chunkedEntries = isProduction ? withProductionSuffix( CHUNKED_BASE_ENTRIES ) : CHUNKED_BASE_ENTRIES;
	const external = ( id, importer ) => isExternalModule( id, importer );
	const globals = createBaseGlobalsResolver();

	const watchers = await runEntries( simpleEntries, ( entryName, entryPath ) => createStandardBuildOptions( {
		isProduction,
		watch,
		outDir: VITE_JS_OUTPUT,
		entryName,
		entryPath,
		external,
		globals,
		plugins: createSharedPlugins( { isProduction, entryPath, entryName } ),
	} ), { watch } );

	if ( Object.keys( chunkedEntries ).length > 0 ) {
		const chunkedWatchers = await buildChunkedEntries( chunkedEntries, isProduction, { watch } );
		return watch ? [ ...( watchers ?? [] ), ...( chunkedWatchers ?? [] ) ] : undefined;
	}

	return watchers;
}

export async function buildFrontendEntries( isProduction, { watch = false } = {} ) {
	const entries = isProduction ? withProductionSuffix( FRONTEND_ENTRIES ) : FRONTEND_ENTRIES;
	return buildChunkedEntries( entries, isProduction, { isFrontend: true, watch } );
}

export async function buildPackageEntries( isProduction, { watch = false } = {} ) {
	const packageEntries = getPackageEntries( isProduction ? 'dist' : 'src' );
	const globals = ( id ) => resolvePackageGlobal( id ) ?? undefined;
	const external = ( id ) => isPackageExternal( id );
	const watchers = [];

	for ( const { name, path: entryPath } of packageEntries ) {
		const camelName = name.replace( /-(\w)/g, ( _, char ) => char.toUpperCase() );
		const plugins = [
			esbuildJsxPlugin( { isProduction } ),
			wordpressAssetFilePlugin( {
				handle: ( handleName ) => `elementor-v2-${ handleName }`,
				map: PACKAGES_EXTERNAL_MAP.map( ( { request, handle } ) => ( { request, handle } ) ),
			} ),
			appendEntryInitPlugin( createPackagesInitInitializer() ),
			applyBannerPlugin( SHARED_BANNER ),
		];

		if ( isProduction ) {
			plugins.push(
				extractI18nStringsPlugin( {
					pattern: ( pathPrefix ) => pathPrefix.replace( /\/src\/index\.ts$/, '' ).replace( /\/dist\/index\.js$/, '' ) + '/src/**/*.{ts,tsx,js,jsx}',
				} ),
			);
		}

		const result = await viteBuild( defineConfig( {
			plugins,
			resolve: {
				alias: { ...JSX_RUNTIME_ALIASES },
				extensions: [ '.tsx', '.ts', '.js', '.jsx' ],
			},
			build: {
				outDir: join( VITE_JS_OUTPUT, 'packages' ),
				emptyOutDir: false,
				sourcemap: ! isProduction,
				minify: isProduction,
				target: 'es2015',
				watch: watch ? {} : null,
				rollupOptions: {
					input: {
						[ name ]: entryPath,
					},
					external,
					transform: { inject: { React: 'react' }, define: SHARED_DEFINE },
					preserveEntrySignatures: 'strict',
					output: {
						format: 'iife',
						name: `elementorV2.${ camelName }`,
						extend: true,
						entryFileNames: isProduction ? '[name]/[name].min.js' : '[name]/[name].js',
						inlineDynamicImports: true,
						keepNames: true,
						globals,
					},
				},
			},
		} ) );

		if ( watch ) {
			watchers.push( result );
		}
	}

	return watch ? watchers : undefined;
}

export async function runBuildTarget( target, isProduction, { watch = false } = {} ) {
	switch ( target ) {
		case 'base':
			return buildBaseEntries( isProduction, { watch } );
		case 'frontend':
			return buildFrontendEntries( isProduction, { watch } );
		case 'packages':
			return buildPackageEntries( isProduction, { watch } );
		default:
			throw new Error( `Unknown build target: ${ target }` );
	}
}
