const { sources: { RawSource } } = require( 'webpack' );

const MODULE_FILTER = [ /((?:[^!?\s]+?)(?:\.js|\.jsx|\.ts|\.tsx))$/, /^((?!node_modules).)*$/ ];

module.exports = class ExtractI18nExpressionsWebpackPlugin {
	translationsRegexps = [];

	constructor( { translationsRegexps } = {} ) {
		if (
			! translationsRegexps ||
			! Array.isArray( translationsRegexps ) ||
			translationsRegexps.some( ( regexp ) => ! ( regexp instanceof RegExp ) )
		) {
			throw new Error( '`translationsRegexps` must be an array of RegExp' );
		}

		this.translationsRegexps = translationsRegexps.map( ( regex ) => {
			const flags = [ ...new Set( [ 'g', 'm', ...regex.flags.split( '' ) ] ) ].join( '' );

			return new RegExp( regex.source, flags );
		} );
	}

	apply( compiler ) {
		compiler.hooks.thisCompilation.tap( this.constructor.name, ( compilation ) => {
			compilation.hooks.processAssets.tap( { name: this.constructor.name }, () => {
				const translationsCallExpression = this.getTranslationsCallExpression( compilation );

				this.addTranslationsCallExpressionToAssets( compilation, translationsCallExpression );
			} );
		} );
	}

	getTranslationsCallExpression( compilation ) {
		const translationsCallExpression = new Map();

		[ ...compilation.chunks ].forEach( ( chunk ) => {
			const chunkJSFile = this.getFileFromChunk( chunk );

			if ( ! chunkJSFile ) {
				// There's no JS file in this chunk, no work for us. Typically a `style.css` from cache group.
				return;
			}

			compilation.chunkGraph.getChunkModules( chunk ).forEach( ( module ) => {
				if ( ! translationsCallExpression.has( chunk.runtime ) ) {
					translationsCallExpression.set( chunk.runtime, new Set() );
				}

				this.getSubModulesToCheck( module ).forEach( ( subModule ) => {
					const source = subModule?._source?._valueAsString;

					if ( ! source ) {
						return;
					}

					this.translationsRegexps.forEach( ( regexp ) => {
						[ ...source.matchAll( regexp ) ].forEach( ( [ firstMatch ] ) => {
							translationsCallExpression.get( chunk.runtime ).add( firstMatch );
						} );
					} );
				} );
			} );
		} );

		return translationsCallExpression;
	}

	addTranslationsCallExpressionToAssets( compilation, translationsCallExpression ) {
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
	}

	getSubModulesToCheck( module ) {
		return [ ...( module.modules || [] ), module ]
			.filter( ( subModule ) => this.shouldCheckModule( subModule ) );
	}

	getFileFromChunk( chunk ) {
		return [ ...chunk.files ].find( ( f ) => /\.js$/i.test( f ) );
	}

	shouldCheckModule( module ) {
		return MODULE_FILTER.every( ( filter ) => filter.test( module.userRequest ) );
	}
};
