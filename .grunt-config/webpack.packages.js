const path = require( 'path' );
const fs = require( 'fs' );
const { GenerateWordPressAssetFileWebpackPlugin } = require( '@elementor/generate-wordpress-asset-file-webpack-plugin' );
const { ExtractI18nWordpressExpressionsWebpackPlugin } = require( '@elementor/extract-i18n-wordpress-experssions-webpack-plugin' );
const { ExternalizeWordPressAssetsWebpackPlugin } = require( '@elementor/externalize-wordpress-assets-webpack-plugin' );

const packages = process.env.ELEMENTOR_PACKAGES_USE_LOCAL ? getPackagesBasedOnLocalRepo() : getPackagesBasedOnProjectDeps()

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
			handle: ( entryName ) => `elementor-packages-${entryName}`,
			map: [
				{ request: /^@elementor\/(.+)$/, handle: 'elementor-packages-$1' },
				{ request: /^@wordpress\/(.+)$/, handle: 'wp-$1' },
				{ request: 'react', handle: 'react' },
				{ request: 'react-dom', handle: 'react-dom' },
			]
		} ),
		new ExternalizeWordPressAssetsWebpackPlugin( {
			global: ( entryName ) => [ '__UNSTABLE__elementorPackages', entryName ],
			map: [
				{ request: /^@elementor\/(.+)$/, global: [ '__UNSTABLE__elementorPackages', '$1' ] },
				{ request: /^@wordpress\/(.+)$/, global: [ 'wp', '$1' ] },
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
	devtool: false, // TODO: Need to check what to do with source maps.
	watch: true, // All the webpack config in the plugin that are dev, should have this property.
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
		new ExtractI18nWordpressExpressionsWebpackPlugin(),
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

function getPackagesBasedOnProjectDeps() {
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

function getPackagesBasedOnLocalRepo() {
	const repoPath = process.env.ELEMENTOR_PACKAGES_PATH;
	const relevantDirs = [ 'packages/core', 'packages/libs' ]

	if ( ! repoPath ) {
		throw new Error('ELEMENTOR_PACKAGES_REPO_PATH is not defined' );
	}

	const packages = relevantDirs.flatMap( ( dir ) => {
		const dirPath = path.resolve( repoPath, dir );
		const packages = fs.readdirSync( path.resolve( repoPath, dir ) )

		return packages.map(( name ) => {
			return {
				name,
				path: path.resolve( dirPath, `${name}/src/index.ts` ),
			}
		})
	} );

	packages.push( {
		name: 'ui',
		path: './node_modules/@elementor/ui/index.js'
	} )

	return packages;
}
