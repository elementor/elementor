const webpack = require( 'webpack' );
const { RawSource } = webpack.sources;

const MODULE_FILTER = [ /((?:[^!?\s]+?)(?:\.js|\.jsx|\.ts|\.tsx))$/, /^((?!node_modules).)*$/ ];

module.exports = class ExtractI18nExpressionsWebpackPlugin {
	translationsRegexps = [];

	constructor( { translationsRegexps } = {} ) {
		if (
			! translationsRegexps ||
			! Array.isArray( this.translationsRegexps ) ||
			this.translationsRegexps.some( ( regexp ) => ! ( regexp instanceof RegExp ) )
		) {
			throw new Error( 'translationsRegexps must be an array of RegExp' );
		}

		this.translationsRegexps = translationsRegexps.map( ( regex ) => {
			const flags = [ ...new Set( [ 'g', 'm', ...regex.flags.split( '' ) ] ) ].join( '' );

			return new RegExp( regex.source, `${ flags }` );
		} );
	}

	apply( compiler ) {
		compiler.hooks.thisCompilation.tap( this.constructor.name, ( compilation ) => {
			compilation.hooks.processAssets.tap( {
				name: this.constructor.name,
			}, () => {
				const translationsCallExpression = new Map();

				[ ...compilation.chunks ].forEach( ( chunk ) => {
					const chunkJSFile = this.getFileFromChunk( chunk );

					if ( ! chunkJSFile ) {
						// There's no JS file in this chunk, no work for us. Typically a `style.css` from cache group.
						return;
					}

					compilation.chunkGraph.getChunkModules( chunk ).forEach( ( module ) => {
						const subModules = new Set();

						[ ...( module.modules || [] ), module ].forEach( ( subModule ) => {
							if ( this.shouldCheckModule( subModule ) ) {
								subModules.add( subModule );
							}
						} );

						subModules.forEach( ( subModule ) => {
							const source = subModule?._source?._valueAsString;

							if ( ! source ) {
								return;
							}

							this.translationsRegexps.forEach( ( regexp ) => {
								[ ...source.matchAll( regexp ) ].forEach( ( [ firstMatch ] ) => {
									if ( ! translationsCallExpression.has( chunk.runtime ) ) {
										translationsCallExpression.set( chunk.runtime, new Set() );
									}

									translationsCallExpression.get( chunk.runtime ).add( firstMatch );
								} );
							} );
						} );
					} );
				} );

				[ ...compilation.entrypoints ].forEach( ( [ id, entrypoint ] ) => {
					const chunk = entrypoint.chunks[ 0 ];
					const chunkJSFile = this.getFileFromChunk( chunk );

					if ( ! chunkJSFile ) {
						return;
					}

					const assetFilename = compilation
						.getPath( '[file]', { filename: chunkJSFile } )
						.replace( /(\.min)?\.js$/i, '.strings.js' );

					// Add source and file into compilation for webpack to output.
					compilation.assets[ assetFilename ] = new RawSource(
						[ ...( translationsCallExpression.get( id ) || new Set() ) ]
							.map( ( expr ) => `${ expr };` )
							.join( '' )
					);

					chunk.files.add( assetFilename );
				} );
			} );
		} );
	}

	getFileFromChunk( chunk ) {
		return [ ...chunk.files ].find( ( f ) => /\.js$/i.test( f ) );
	}

	shouldCheckModule( module ) {
		return MODULE_FILTER.every( ( filter ) => filter.test( module.userRequest ) );
	}
};
