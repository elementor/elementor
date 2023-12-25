const fs = require( 'fs' );
const path = require( 'path' );

const MODULE_FILTERS = Object.freeze( [ /(([^!?\s]+?)(?:\.js|\.jsx|\.ts|\.tsx))$/, /^((?!node_modules).)*$/ ] );

const COMMENTS_REGEXPS = Object.freeze( [
	// Matches translators comment block: `/* translators: %s */`.
	/\/\*[\t ]*translators:.*\*\//gm,
	/// Matches translators inline comment: `// translators: %s`.
	/(\/\/)[\t ]*translators:[^\r\n]*/gm,
] );

const TRANSLATIONS_REGEXPS = Object.freeze( [
	// Matches translation functions: `__('Hello', 'elementor')`, `_n('Me', 'Us', 2, 'elementor-pro')`.
	/\b_(?:_|n|nx|x)\(.*?,\s*(?<c>['"`])[\w-]+\k<c>\)/gm,
] );

module.exports = class ExtractI18nExpressionsWebpackPlugin {
	apply( compiler ) {
		// Learn more about Webpack plugin system: https://webpack.js.org/api/plugins/

		let translationCallExpressions = [];

		// Learn more about Webpack compilation process and hooks: https://webpack.js.org/api/compilation-hooks/
		compiler.hooks.thisCompilation.tap( this.constructor.name, ( compilation ) => {
			// We tap into the time that Webpack has finished processing all the other assets
			// learn more: https://webpack.js.org/api/compilation-hooks/#processassets.
			compilation.hooks.processAssets.tap( { name: this.constructor.name }, () => {
				translationCallExpressions = this.getModuleExpressionsMap( compilation );
			} );
		} );

		compiler.hooks.afterEmit.tapPromise( this.constructor.name, async ( compilation ) => {
			// Create all the translations files based on the call expressions.
			await this.createTranslationsFiles( compilation, translationCallExpressions );
		} );
	}

	getModuleExpressionsMap( compilation ) {
		const moduleExpressionsMap = new Map();

		[ ...compilation.chunks ].forEach( ( chunk ) => {
			const chunkJSFile = this.getFileFromChunk( chunk );

			if ( ! chunkJSFile ) {
				// There's no JS file in this chunk, no work for us. Typically a `style.css` from cache group.
				return;
			}

			compilation.chunkGraph.getChunkModules( chunk ).forEach( ( module ) => {
				this.getSubModulesToCheck( module ).forEach( ( subModule ) => {
					const mainEntryFile = this.findMainModuleOfEntry( subModule, compilation );

					if ( ! moduleExpressionsMap.has( mainEntryFile ) ) {
						moduleExpressionsMap.set( mainEntryFile, [] );
					}

					// Running over the submodules and find all the translation call expressions and their translators comment
					// (e.g `/* translators: %s: name*/ __('Hello %s', 'elementor')`),
					// extract them and add them to a Map, where the key is the main entry file, and the value is an array of all the
					// translation call expressions.
					this.extractExpressionsFromSubmodule( subModule ).forEach( ( expression ) => {
						moduleExpressionsMap.get( mainEntryFile ).push( expression );
					} );
				} );
			} );
		} );

		return moduleExpressionsMap;
	}

	async createTranslationsFiles( compilation, translationCallExpressions ) {
		const promises = [ ...compilation.entrypoints ].map( ( [ id, entrypoint ] ) => {
			const chunk = entrypoint.chunks.find( ( { name } ) => name === id );

			const chunkJSFile = this.getFileFromChunk( chunk );

			if ( ! chunkJSFile ) {
				return Promise.resolve();
			}

			const mainFilePath = compilation.options.entry[ id ].import[ 0 ];

			const assetFilename = this.generateTranslationFilename(
				compilation.options.output.path,
				compilation.getPath( '[file]', { filename: chunkJSFile } )
			);

			const assetFileContent = this.generateTranslationFileContent(
				translationCallExpressions.get( mainFilePath ) || []
			);

			return fs.promises.writeFile( assetFilename, assetFileContent );
		} );

		return await Promise.all( promises );
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

	extractExpressionsFromSubmodule( subModule ) {
		const source = subModule?._source?._valueAsString;

		if ( ! source ) {
			return [];
		}

		const translationCallExpressions = [];

		[
			...TRANSLATIONS_REGEXPS,
			...COMMENTS_REGEXPS,
		].forEach( ( regexp ) => {
			[ ...source.matchAll( regexp ) ].forEach( ( res ) => {
				translationCallExpressions.push( {
					type: COMMENTS_REGEXPS.includes( regexp ) ? 'comment' : 'call-expression',
					index: res.index,
					value: res[ 0 ],
				} );
			} );
		} );

		return translationCallExpressions;
	}

	generateTranslationFilename( basePath, filename ) {
		return path.join(
			basePath,
			filename.replace( /(\.min)?\.js$/i, '.strings.js' )
		);
	}

	generateTranslationFileContent( expressions ) {
		return expressions
			// Sort by the index it was found in the file based on the regexp (and not by the order it was added to the array).
			.sort( ( a, b ) => a.index - b.index )
			// Add a semicolon when needed.
			.map( ( expr ) => `${ expr.value }${ expr.type === 'comment' ? '' : ';' }` )
			// Join all the expressions to a single string with line-breaks between them.
			.join( '\n' );
	}
};
