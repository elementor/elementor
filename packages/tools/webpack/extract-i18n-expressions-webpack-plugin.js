const { sources: { RawSource } } = require( 'webpack' );

const MODULE_FILTERS = Object.freeze( [ /(([^!?\s]+?)(?:\.js|\.jsx|\.ts|\.tsx))$/, /^((?!node_modules).)*$/ ] );

module.exports = class ExtractI18nExpressionsWebpackPlugin {
	translationsRegexps;
	generateTranslationFilename;

	constructor( {
		// WordPress i18n function, example for regex match: `__('Hello', 'elementor')`, `_n('Me', 'Us', 2, 'elementor-pro')`.
		translationsRegexps = [ /\b_(?:_|n|nx|x)\(.+,\s*(?<c>['"`])[\w-]+\k<c>\)/ ],
		generateTranslationFilename,
	} = {} ) {
		if (
			! translationsRegexps ||
			! Array.isArray( translationsRegexps ) ||
			translationsRegexps.some( ( regexp ) => ! ( regexp instanceof RegExp ) )
		) {
			throw new Error( '`translationsRegexps` must be an array of RegExp' );
		}

		this.generateTranslationFilename = generateTranslationFilename || this.defaultGenerateTranslationFilename;
		this.translationsRegexps = translationsRegexps.map( ( regex ) => {
			const flags = [ ...new Set( [ 'g', 'm', ...regex.flags.split( '' ) ] ) ].join( '' );

			return new RegExp( regex.source, flags );
		} );
	}

	apply( compiler ) {
		// Learn more about Webpack plugin system: https://webpack.js.org/api/plugins/

		// Learn more about Webpack compilation process and hooks: https://webpack.js.org/api/compilation-hooks/
		compiler.hooks.thisCompilation.tap( this.constructor.name, ( compilation ) => {
			// We tap into the time that Webpack has finished processing all the other assets
			// learn more: https://webpack.js.org/api/compilation-hooks/#processassets.
			compilation.hooks.processAssets.tap( { name: this.constructor.name }, () => {
				const translationCallExpressions = this.getTranslationCallExpressions( compilation );

				// Add all the translation call expressions to Webpack assets as a seperated file,
				// and let Webpack create this file.
				this.addTranslationCallExpressionsToAssets( compilation, translationCallExpressions );
			} );
		} );
	}

	getTranslationCallExpressions( compilation ) {
		const translationCallExpressions = new Map();

		[ ...compilation.chunks ].forEach( ( chunk ) => {
			const chunkJSFile = this.getFileFromChunk( chunk );

			if ( ! chunkJSFile ) {
				// There's no JS file in this chunk, no work for us. Typically a `style.css` from cache group.
				return;
			}

			compilation.chunkGraph.getChunkModules( chunk ).forEach( ( module ) => {
				this.getSubModulesToCheck( module ).forEach( ( subModule ) => {
					const mainEntryFile = this.findMainModuleOfEntry( subModule, compilation );

					if ( ! translationCallExpressions.has( mainEntryFile ) ) {
						translationCallExpressions.set( mainEntryFile, new Set() );
					}

					// Running over the submodules and find all the translation call expressions (e.g `__('Hello', 'elementor')`),
					// extract them and add them to a Map, where the key is the main entry file, and the value is a Set of all the
					// translation call expressions.
					this.getTranslationCallExpressionsFromSubmodule( subModule ).forEach( ( callExpression ) => {
						translationCallExpressions.get( mainEntryFile ).add( callExpression );
					} );
				} );
			} );
		} );

		return translationCallExpressions;
	}

	addTranslationCallExpressionsToAssets( compilation, translationCallExpressions ) {
		[ ...compilation.entrypoints ].forEach( ( [ id, entrypoint ] ) => {
			const chunk = entrypoint.chunks.find( ( { name } ) => name === id );
			const chunkJSFile = this.getFileFromChunk( chunk );

			if ( ! chunkJSFile ) {
				return;
			}

			const mainFilePath = compilation.options.entry[ id ].import[ 0 ];

			const assetFilename = this.generateTranslationFilename(
				compilation.getPath( '[file]', { filename: chunkJSFile } )
			);

			// Create Webpack source object which represents a new file, and add it to Webpack assets array.
			compilation.assets[ assetFilename ] = new RawSource(
				[ ...( translationCallExpressions.get( mainFilePath ) || new Set() ) ]
					.map( ( expr ) => `${ expr };` )
					.join( '' )
			);

			// Let Webpack know that the file that was created is a part of the chunk we're currently processing.
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
		return MODULE_FILTERS.every( ( filter ) => !! filter.test( module.userRequest ) );
	}

	findMainModuleOfEntry( module, compilation ) {
		if ( compilation.moduleGraph.getIssuer( module ) ) {
			return this.findMainModuleOfEntry( compilation.moduleGraph.getIssuer( module ), compilation );
		}

		return module.rawRequest;
	}

	getTranslationCallExpressionsFromSubmodule( subModule ) {
		const source = subModule?._source?._valueAsString;

		if ( ! source ) {
			return [];
		}

		const translationCallExpressions = [];

		this.translationsRegexps.forEach( ( regexp ) => {
			[ ...source.matchAll( regexp ) ].forEach( ( [ callExpression ] ) => {
				translationCallExpressions.push( callExpression );
			} );
		} );

		return translationCallExpressions;
	}

	defaultGenerateTranslationFilename( filename ) {
		return filename.replace( /(\.min)?\.js$/i, '.strings.js' );
	}
};
