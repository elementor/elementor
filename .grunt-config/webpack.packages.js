const path = require( 'path' );
const fs = require( 'fs' );
const { GenerateWordPressAssetFileWebpackPlugin } = require( '@elementor/generate-wordpress-asset-file-webpack-plugin' );
const { ExtractI18nWordpressExpressionsWebpackPlugin } = require( '@elementor/extract-i18n-wordpress-expressions-webpack-plugin' );
const { ExternalizeWordPressAssetsWebpackPlugin } = require( '@elementor/externalize-wordpress-assets-webpack-plugin' );

const usingLocalRepo = process.env.ELEMENTOR_PACKAGES_USE_LOCAL;

const packages = usingLocalRepo ? getLocalRepoPackagesEntries() : getNodeModulesPackagesEntries();

const REGEXES = {
	// @elementor/ui/SvgIcon. Used inside @elementor/icons
	elementorPathImports: /^@elementor\/(ui|icons)\/(.+)$/,

	// @elementor/editor
	// We want to bundle `@elementor/design-tokens` inside the UI package since it's an internal thing.
	elementorPackages: /^@elementor\/(?!design-tokens)(.+)$/,

	// @wordpress/components
	wordpressPackages: /^@wordpress\/(.+)$/,
};

const common = {
	name: 'packages',
	entry: Object.fromEntries(
		packages.map( ( { name, path } ) => [ name, path ] )
	),
	module: {
		rules: [
			{
				test: /\.[jt]sx?$/,
				exclude: /node_modules/,
				use: {
					loader: 'babel-loader',
					options: {
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
		extensions: [ '.tsx', '.ts', '.js', '.jsx' ],
	},
	plugins: [
		new GenerateWordPressAssetFileWebpackPlugin( {
			handle: ( entryName ) => `elementor-v2-${entryName}`,
			map: [
				{ request: REGEXES.elementorPathImports, handle: 'elementor-v2-$1' },
				{ request: REGEXES.elementorPackages, handle: 'elementor-v2-$1' },
				{ request: REGEXES.wordpressPackages, handle: 'wp-$1' },
				{ request: 'react', handle: 'react' },
				{ request: 'react-dom', handle: 'react-dom' },
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
			]
		} ),
	],
	output: {
		path: path.resolve( __dirname, '../assets/js/packages/' ),
	},
}

const devConfig = {
	...common,
	mode: 'development',
	devtool: usingLocalRepo ? 'source-map' : false,
	watch: true, // All the webpack config in the plugin that are dev, should have this property.
	optimization: {
		...( common.optimization || {} ),
		// Intentionally minimizing the dev assets to reduce the bundle size.
		minimize: true,
	},
	output: {
		...( common.output || {} ),
		filename: '[name]/[name].js',
	}
}

const prodConfig = {
	...common,
	mode: 'production',
	devtool: false, // TODO: Need to check what to do with source maps.
	optimization: {
		...( common.optimization || {} ),
		minimize: true,
	},
	plugins: [
		...( common.plugins || [] ),
		new ExtractI18nWordpressExpressionsWebpackPlugin( {
			pattern: ( entryPath ) => path.resolve( entryPath, '../../src/**/*.{ts,tsx,js,jsx}' ),
		} ),
	],
	output: {
		...( common.output || {} ),
		filename: '[name]/[name].min.js',
	}
}

module.exports = {
	dev: devConfig,
	prod: prodConfig,
};

function getNodeModulesPackagesEntries() {
	const { dependencies } = require( '../package.json' );

	return Object.keys( dependencies )
		.filter( ( packageName ) => packageName.startsWith( '@elementor/' ) )
		.map( ( packageName ) => {
			const pkgJSON = fs.readFileSync( path.resolve( __dirname, `../node_modules/${packageName}/package.json` ) );

			const { main, module } = JSON.parse( pkgJSON );

			return {
				mainFile: module || main,
				packageName,
			}
		} )
		.filter( ( { mainFile } ) => !! mainFile )
		.map( ( { mainFile, packageName } ) => ( {
			name: packageName.replace( '@elementor/', '' ),
			path: path.resolve( __dirname, `../node_modules/${ packageName }`, mainFile ),
		} ) );
}

function getLocalRepoPackagesEntries() {
	const repoPath = process.env.ELEMENTOR_PACKAGES_PATH;
	const relevantDirs = [ 'packages/core', 'packages/libs' ]

	if ( ! repoPath ) {
		throw new Error( 'ELEMENTOR_PACKAGES_PATH is not defined, define it in your operating system environment variables.' );
	}

	if ( ! fs.existsSync( repoPath ) ) {
		throw new Error( `ELEMENTOR_PACKAGES_PATH is defined but the path ${repoPath} does not exist.` );
	}

	const packages = relevantDirs.flatMap( ( dir ) =>
		fs.readdirSync( path.resolve( repoPath, dir ) )
			.map( ( name ) => ( {
				name,
				path: path.resolve( repoPath, dir, `${name}/src/index.ts` ),
			} ) )
			.filter( ( { path } ) => fs.existsSync( path ) )
	);

	packages.push( {
		name: 'ui',
		path: './node_modules/@elementor/ui/index.js'
	} );

	packages.push( {
		name: 'icons',
		path: './node_modules/@elementor/icons/index.js'
	} );

	return packages;
}
