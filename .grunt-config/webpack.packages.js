const path = require( 'path' );
const fs = require( 'fs' );
const { GenerateWordPressAssetFileWebpackPlugin } = require( path.resolve( __dirname, '../packages/packages/tools/generate-wordpress-asset-file-webpack-plugin' ) );
const { ExtractI18nWordpressExpressionsWebpackPlugin } = require( path.resolve( __dirname, '../packages/packages/tools/extract-i18n-wordpress-expressions-webpack-plugin' ) );
const { ExternalizeWordPressAssetsWebpackPlugin } = require( path.resolve( __dirname, '../packages/packages/tools/externalize-wordpress-assets-webpack-plugin' ) );
const { EntryInitializationWebpackPlugin } = require( path.resolve( __dirname, '../packages/packages/tools/entry-initialization-webpack-plugin' ) );
const TerserPlugin = require( 'terser-webpack-plugin' );

// source-map-loader and the babel-loader dist exclude only match packages built from packages/packages/{core,libs} and packages/apps. Extend this if new first-party roots ship prebuilt dist next to sources.

const packagesDistPattern = /[\\/]packages[\\/](?:packages[\\/](?:core|libs)|apps)[\\/][^\\/]+[\\/]dist[\\/]/;

const REGEXES = {
	// @elementor/ui/SvgIcon — used inside @elementor/icons.
	// Excludes `@elementor/ui/styles` which is a self-referencing internal import inside `@elementor/ui` and must be bundled into ui.js.
	elementorPathImports: /^@elementor\/(ui|icons)\/(?!styles$)(.+)$/,

	// @elementor/editor
	// Excludes `design-tokens` (bundled inside UI) and `ui/styles` (self-referencing internal import inside `@elementor/ui`).
	elementorPackages: /^@elementor\/(?!design-tokens|ui\/styles)(.+)$/,

	// @wordpress/components
	wordpressPackages: /^@wordpress\/(.+)$/,
};

const filesystemCache = {
	type: 'filesystem',
	cacheDirectory: path.resolve( __dirname, '../node_modules/.cache/webpack-packages' ),
	buildDependencies: {
		config: [ __filename ],
	},
};

function createCommonConfig( entrySource ) {
	const packages = getLocalRepoPackagesEntries( entrySource );

	return {
		name: 'packages',
		entry: Object.fromEntries(
			packages.map( ( { name, path: entryPath } ) => [ name, entryPath ] )
		),
		module: {
			rules: [
				{
					enforce: 'pre',
					test: /\.m?js$/,
					include: packagesDistPattern,
					use: [ 'source-map-loader' ],
				},
				{
					test: /\.[jt]sx?$/,
					exclude: [
						/node_modules/,
						packagesDistPattern,
					],
					use: {
						loader: 'babel-loader',
						options: {
							sourceMaps: true,
							presets: [
								'@babel/preset-typescript',
								'@babel/preset-react',
							],
						},
					},
				},
			],
		},
		resolve: {
			extensions: [ '.tsx', '.ts', '.js', '.jsx', '.mjs' ],
		},
		ignoreWarnings: [
			// Many upstream maps are incomplete; surfacing every parse failure is noise without improving the bundle.
			/Failed to parse source map/,
		],
		cache: filesystemCache,
		plugins: [
			new GenerateWordPressAssetFileWebpackPlugin( {
				handle: ( entryName ) => `elementor-v2-${entryName}`,
				map: [
					{ request: REGEXES.elementorPathImports, handle: 'elementor-v2-$1' },
					{ request: REGEXES.elementorPackages, handle: 'elementor-v2-$1' },
					{ request: REGEXES.wordpressPackages, handle: 'wp-$1' },
					{ request: 'react', handle: 'react' },
					{ request: 'react-dom', handle: 'react-dom' },
					{ request: '@reduxjs/toolkit', handle: 'elementor-vendors-redux' },
					{ request: 'react-redux', handle: 'elementor-vendors-redux' },
				]
			} ),
			new ExternalizeWordPressAssetsWebpackPlugin( {
				global: ( entryName ) => [ 'elementorV2', entryName ],
				map: [
					{ request: REGEXES.elementorPathImports, global: [ 'elementorV2', '$1', '$2' ] },
					{ request: REGEXES.elementorPackages, global: [ 'elementorV2', '$1' ] },
					{ request: REGEXES.wordpressPackages, global: [ 'wp', '$1' ] },
					{ request: 'react', global: 'React' },
					{ request: 'react-dom', global: 'ReactDOM' },
					{ request: '@reduxjs/toolkit', global: [ 'elementorVendors', 'reduxToolkit' ] },
					{ request: 'react-redux', global: [ 'elementorVendors', 'reactRedux' ] },
				]
			} ),
			new EntryInitializationWebpackPlugin( {
				initializer: ( { entryName } ) => {
					return `window.elementorV2.${ entryName }?.init?.();`;
				},
			} ),
		],
		output: {
			path: path.resolve( __dirname, '../assets/js/packages/' ),
		},
		performance: {
			hints: false,
		},
	};
}

const devCommon = createCommonConfig( 'src' );
const prodCommon = createCommonConfig( 'dist' );

const devConfig = {
	...devCommon,
	mode: 'development',
	devtool: 'source-map',
	watch: true, // All the webpack config in the plugin that are dev, should have this property.
	optimization: {
		// Faster rebuilds and stacks that line up with TypeScript; output is larger than the previous minimized dev bundles.
		minimize: false,
	},
	module: {
		...devCommon.module,
		rules: devCommon.module.rules.map( ( rule ) => {
			if ( rule.use?.loader !== 'babel-loader' ) {
				return rule;
			}
			return {
				...rule,
				use: {
					...rule.use,
					options: {
						...rule.use.options,
						plugins: [
							[ '@emotion/babel-plugin', { autoLabel: 'dev-only', labelFormat: '[local]' } ],
						],
					},
				},
			};
		} ),
	},
	output: {
		...( devCommon.output || {} ),
		filename: '[name]/[name].js',
	},
};

const prodConfig = {
	...prodCommon,
	mode: 'production',
	// Keep prod free of emitted source maps without depending on webpack default behavior across upgrades.
	devtool: false,
	optimization: {
		minimize: true,
		minimizer: [
			new TerserPlugin( {
				terserOptions: {
					keep_classnames: true,
					keep_fnames: true,
				},
			} ),
		],
	},
	plugins: [
		...( prodCommon.plugins || [] ),
		new ExtractI18nWordpressExpressionsWebpackPlugin( {
			pattern: ( entryPath ) => path.resolve( entryPath, '../../src/**/*.{ts,tsx,js,jsx}' ),
		} ),
	],
	output: {
		...( prodCommon.output || {} ),
		filename: '[name]/[name].min.js',
	},
};

module.exports = {
	dev: devConfig,
	prod: prodConfig,
};

function getLocalRepoPackagesEntries( entrySource ) {
	const repoPath = path.resolve( __dirname, '../packages' );
	const relevantDirs = [ 'packages/core', 'packages/libs', 'apps' ];

	const packages = relevantDirs.flatMap( ( dir ) =>
		fs.readdirSync( path.resolve( repoPath, dir ) )
			.map( ( name ) => ( {
				name,
				path: getPackageEntryPath( path.resolve( repoPath, dir, name ), entrySource ),
			} ) )
			.filter( ( { path: entryPath } ) => fs.existsSync( entryPath ) )
	);

	packages.push( {
		name: 'ui',
		path: './node_modules/@elementor/ui/index.js',
	} );

	packages.push( {
		name: 'icons',
		path: './node_modules/@elementor/icons/index.js',
	} );

	return packages;
}

function getPackageEntryPath( packageDir, entrySource ) {
	const srcTs = path.join( packageDir, 'src/index.ts' );

	if ( 'src' === entrySource ) {
		return srcTs;
	}

	const distJs = path.join( packageDir, 'dist/index.js' );

	if ( fs.existsSync( distJs ) ) {
		return distJs;
	}

	// Production asked for dist but it is missing; falling back to src would ship a mixed graph without this signal.
	console.warn( '[webpack.packages] Production build is using TypeScript instead of missing dist:', distJs );

	return srcTs;
}
