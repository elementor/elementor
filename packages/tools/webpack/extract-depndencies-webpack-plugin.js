// Inspired by "Dependency Extraction Webpack Plugin" by @wordpress team.
// Link: https://github.com/WordPress/gutenberg/tree/trunk/packages/dependency-extraction-webpack-plugin

const { sources: { RawSource } } = require( 'webpack' );

module.exports = class ExtractDependenciesWebpackPlugin {
	generateHandleName;
	replaceDependencyNames;
	generateAssetsFileName;

	constructor( {
		generateHandleName,
		replaceDependencyNames,
		generateAssetsFileName,
	} = {} ) {
		this.generateHandleName = generateHandleName || this.defaultGenerateHandleName;
		this.replaceDependencyNames = replaceDependencyNames || this.defaultReplaceDependencyNames;
		this.generateAssetsFileName = generateAssetsFileName || this.defaultGenerateAssetsFileName;
	}

	apply( compiler ) {
		compiler.hooks.thisCompilation.tap( this.constructor.name, ( compilation ) => {
			compilation.hooks.processAssets.tap( { name: this.constructor.name }, () => {
				[ ...compilation.entrypoints ].forEach( ( [ id, entrypoint ] ) => {
					const chunk = entrypoint.chunks.find( ( c ) => c.name === id );
					const chunkJSFile = this.getFileFromChunk( chunk );

					if ( ! chunkJSFile ) {
						return;
					}

					const deps = this.getDepsFromChunk( compilation, chunk );

					const assetFilename = this.generateAssetsFileName(
						compilation.getPath( '[file]', { filename: chunkJSFile } )
					);

					const content = this.createAssetsFileContent(
						id,
						deps,
						compilation.options.optimization.minimize
					);

					// Add source and file into compilation for webpack to output.
					compilation.assets[ assetFilename ] = new RawSource( content );

					chunk.files.add( assetFilename );
				} );
			} );
		} );
	}

	getDepsFromChunk( compilation, chunk ) {
		const externals = Object.keys( compilation.options.externals );
		const depsSet = new Set();

		compilation.chunkGraph.getChunkModules( chunk ).forEach( ( module ) => {
			[ ...( module.modules || [] ), module ].forEach( ( subModule ) => {
				if ( ! externals.includes( subModule.userRequest ) ) {
					return;
				}

				depsSet.add( subModule.userRequest );
			} );
		} );

		return depsSet;
	}

	createAssetsFileContent( entryId, deps, shouldMinify ) {
		const depsInString = [ ...deps ]
			.sort()
			.map( ( dep ) => this.replaceDependencyNames( dep ) )
			.map( ( dep ) => `		'${ dep }',\n` )
			.join( '' );

		let content =
			'<?php\n\n' +
			'if ( ! defined( \'ABSPATH\' ) ) {\n' +
			'	exit;\n' +
			'}\n\n' +
			'return [\n' +
			`	'handle' => '${ this.generateHandleName( entryId ) }',\n` +
			`	'deps' => [\n` +
					depsInString +
			'	],\n' +
			'];\n';

		if ( shouldMinify ) {
			content = content
				.replaceAll( /[\n\t ]/gm, '' )
				.replace( '<?php', '<?php\n' );
		}

		return content;
	}

	getFileFromChunk( chunk ) {
		return [ ...chunk.files ].find( ( f ) => /\.js$/i.test( f ) );
	}

	defaultReplaceDependencyNames( name ) {
		const map = new Map( [
			[ '@elementor/', 'elementor-packages-' ],
			[ '@wordpress/', 'wp-' ],
		] );

		for ( const [ key, value ] of map ) {
			if ( name.startsWith( key ) ) {
				return name.replace( key, value );
			}
		}

		return name;
	}

	defaultGenerateAssetsFileName( filename ) {
		return filename.replace( /(\.min)?\.js$/i, '.asset.php' );
	}

	defaultGenerateHandleName( name ) {
		return `elementor-packages-${ name }`;
	}
};
