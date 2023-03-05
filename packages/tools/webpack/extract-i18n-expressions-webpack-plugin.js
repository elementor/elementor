const fs = require( 'fs' );
const path = require( 'path' );

const MODULE_FILTERS = Object.freeze( [ /(([^!?\s]+?)(?:\.js|\.jsx|\.ts|\.tsx))$/, /^((?!node_modules).)*$/ ] );

module.exports = class ExtractI18nExpressionsWebpackPlugin {
	translationsRegexps;
	generateTranslationFilename;

	constructor( {
		// WordPress i18n function, example for regex match: `__('Hello', 'elementor')`, `_n('Me', 'Us', 2, 'elementor-pro')`.
		translationsRegexps = [
			/\/\*\s*translators:.*\*\//,
			/(\/\/) *translators:[^\r\n]*/,
			/\b_(?:_|n|nx|x)\(.*?,\s*(?<c>['"`])[\w-]+\k<c>\)/,
		],
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

		let translationCallExpressions = [];

		// Learn more about Webpack compilation process and hooks: https://webpack.js.org/api/compilation-hooks/
		compiler.hooks.thisCompilation.tap( this.constructor.name, ( compilation ) => {
			// We tap into the time that Webpack has finished processing all the other assets
			// learn more: https://webpack.js.org/api/compilation-hooks/#processassets.
			compilation.hooks.processAssets.tap( { name: this.constructor.name }, () => {
				translationCallExpressions = this.getTranslationCallExpressions( compilation );
			} );
		} );

		compiler.hooks.afterEmit.tapPromise( this.constructor.name, async ( compilation ) => {
			// Create all the translations files based on the call expressions.
			await this.createTranslationsFiles( compilation, translationCallExpressions );
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
						translationCallExpressions.set( mainEntryFile, [] );
					}

					// Running over the submodules and find all the translation call expressions (e.g `__('Hello', 'elementor')`),
					// extract them and add them to a Map, where the key is the main entry file, and the value is a Set of all the
					// translation call expressions.
					this.getTranslationCallExpressionsFromSubmodule( subModule ).forEach( ( callExpression ) => {
						translationCallExpressions.get( mainEntryFile ).push( callExpression );
					} );
				} );
			} );
		} );

		return translationCallExpressions;
	}

	async createTranslationsFiles( compilation, translationCallExpressions ) {
		for ( const [ id, entrypoint ] of [ ...compilation.entrypoints ] ) {
			const chunk = entrypoint.chunks.find( ( { name } ) => name === id );

			const chunkJSFile = this.getFileFromChunk( chunk );

			if ( ! chunkJSFile ) {
				return;
			}

			const mainFilePath = compilation.options.entry[ id ].import[ 0 ];

			const assetFilename = this.generateTranslationFilename(
				compilation.getPath( '[file]', { filename: chunkJSFile } )
			);

			const isComment = ( expr ) => /^(\/\/|\/\*).+/.test( expr );

			await fs.promises.writeFile(
				path.join( compilation.options.output.path, assetFilename ),
				( translationCallExpressions.get( mainFilePath ) || [] )
					.map( ( expr ) => `${ expr }${ isComment( expr ) ? '' : ';' }` )
					.join( '\n' )
			);
		}
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
			[ ...source.matchAll( regexp ) ].forEach( ( res ) => {
				translationCallExpressions.push( {
					index: res.index,
					value: res[ 0 ],
				} );
			} );
		} );

		return translationCallExpressions
			.sort( ( a, b ) => a.index - b.index )
			.map( ( { value } ) => value );
	}

	defaultGenerateTranslationFilename( filename ) {
		return filename.replace( /(\.min)?\.js$/i, '.strings.js' );
	}
};
