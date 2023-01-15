// Inspired by "Dependency Extraction Webpack Plugin" by @wordpress team.
// Link: https://github.com/WordPress/gutenberg/tree/trunk/packages/dependency-extraction-webpack-plugin

const { sources: { RawSource } } = require( 'webpack' );

module.exports = class ExtractDependenciesWebpackPlugin {
	apply( compiler ) {
		compiler.hooks.thisCompilation.tap( this.constructor.name, ( compilation ) => {
			compilation.hooks.processAssets.tap( { name: this.constructor.name }, () => {
				const externalDependencies = this.getExternalsDependencies( compilation );

				console.log( externalDependencies );

				// this.addExternalDependenciesToAssets( compilation, externalDependencies );
			} );
		} );
	}

	getExternalsDependencies( compilation ) {
		const externals = Object.keys( compilation.options.externals );
		const externalDependencies = new Map();

		[ ...compilation.chunks ].forEach( ( chunk ) => {
			const chunkJSFile = this.getFileFromChunk( chunk );

			if ( ! chunkJSFile ) {
				// There's no JS file in this chunk, no work for us. Typically a `style.css` from cache group.
				return;
			}

			compilation.chunkGraph.getChunkModules( chunk ).forEach( ( module ) => {
				[ ...( module.modules || [] ), module ].forEach( ( subModule ) => {
					if ( ! externals.includes( subModule.userRequest ) ) {
						return;
					}

					const mainEntryFile = this.findMainModuleOfEntry( subModule, compilation );
					console.log( mainEntryFile, subModule.userRequest );

					if ( ! externalDependencies.has( mainEntryFile ) ) {
						externalDependencies.set( mainEntryFile, new Set() );
					}

					externalDependencies.get( mainEntryFile ).add( subModule.userRequest );
				} );
			} );
		} );

		return externalDependencies;
	}

	addExternalDependenciesToAssets( compilation, externalDependencies ) {
		const shouldMinify = compilation.options.optimization.minimize;

		[ ...compilation.entrypoints ].forEach( ( [ id, entrypoint ] ) => {
			const chunk = entrypoint.chunks[ 0 ];
			const chunkJSFile = this.getFileFromChunk( chunk );

			if ( ! chunkJSFile ) {
				return;
			}

			const assetFilename = compilation
				.getPath( '[file]', { filename: chunkJSFile } )
				.replace( /(\.min)?\.js$/i, '.assets.php' );

			const deps = [ ...( externalDependencies.get( id ) || new Set() ) ]
				.sort()
				.map( ( dep ) => `		'${ dep }',\n` )
				.join( '' );

			let content =
				'<?php\n\n' +
				'if ( ! defined( \'ABSPATH\' ) ) {\n' +
				'	exit;\n' +
				'}\n\n' +
				'return [\n' +
				`	'handle' => '@elementor/${ id }',\n` +
				`	'deps' => [\n` +
						deps +
				'	],\n' +
				'];\n';

			if ( shouldMinify ) {
				content = content
					.replaceAll( /[\n\t ]/gm, '' )
					.replace( '<?php', '<?php\n' );
			}

			// Add source and file into compilation for webpack to output.
			compilation.assets[ assetFilename ] = new RawSource( content );

			chunk.files.add( assetFilename );
		} );
	}

	getFileFromChunk( chunk ) {
		return [ ...chunk.files ].find( ( f ) => /\.js$/i.test( f ) );
	}

	findMainModuleOfEntry( module, compilation ) {
		if ( compilation.moduleGraph.getIssuer( module ) ) {
			return this.findMainModuleOfEntry( compilation.moduleGraph.getIssuer( module ), compilation );
		}

		return module.rawRequest;
	}
};
