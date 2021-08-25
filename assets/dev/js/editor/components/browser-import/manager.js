import Normalizer from './normalizer';
import FileReaderBase from './files/file-reader-base';
import FileParserBase from './files/file-parser-base';
import Session from 'elementor-editor/components/browser-import/session';
import FileCollection from 'elementor-editor/components/browser-import/files/file-collection';

export default class Manager {
	/**
	 * File-readers list.
	 *
	 * @type {{}}
	 */
	readers = {};

	/**
	 * File-parsers list according to their readers.
	 *
	 * @type {{}}
	 */
	parsers = {};

	/**
	 * Manager constructor.
	 */
	constructor( config = {} ) {
		this.parseConfig( config );

		this.normalizer = new Normalizer( this );
	}

	/**
	 * Parse the config for the Manager.
	 *
	 * @param config
	 */
	parseConfig( config = {} ) {
		for ( const reader of config.readers ) {
			this.registerFileReader( reader );
		}

		for ( const parser of config.parsers ) {
			this.registerFileParser( parser );
		}
	}

	/**
	 * Create a new Session instance and normalize input if needed.
	 *
	 * @returns {Session}
	 */
	async createSession( input, container, options = {} ) {
		if ( ! ( input instanceof FileCollection ) ) {
			input = await this.getNormalizer().normalize( input );
		}

		return new Session( this, input, container, options );
	}

	/**
	 * Register a new file-reader.
	 *
	 * @param reader
	 */
	registerFileReader( reader ) {
		this.readers[ reader.getName() ] = reader;
	}

	/**
	 * Register a new file-parser.
	 *
	 * @param parser
	 */
	registerFileParser( parser ) {
		for ( const readerName of parser.getReaders() ) {
			if ( ! this.readers[ readerName ] ) {
				throw new Error( `Reader ${ readerName } is not registered.` );
			} else if ( ! this.parsers[ readerName ] ) {
				this.parsers[ readerName ] = {};
			}

			this.parsers[ readerName ][ parser.getName() ] = parser;
		}
	}

	/**
	 * Get the file-handler that can handle the given file.
	 *
	 * @param file
	 * @param options
	 * @returns {FileReaderBase|boolean}
	 */
	async getReaderOf( file, options = {} ) {
		const { instantiate = false, reader: readerName } = options,
			prepare = async ( reader ) => {
				return await reader.validate( file ) &&
					( instantiate ? new reader( file ) : reader );
			};

		if ( readerName ) {
			const reader = this.getReaders()[ readerName ];

			if ( reader ) {
				return await prepare( reader );
			}
		} else {
			for ( const reader of Object.values( this.getReaders() ) ) {
				const prepared = await prepare( reader );

				if ( prepared ) {
					return prepared;
				}
			}
		}

		return false;
	}

	/**
	 * Get the file-parser that can handle the given file.
	 *
	 * @param file
	 * @param options
	 * @returns {Promise<FileParserBase|boolean>}
	 */
	async getParserOf( file, options = {} ) {
		const { instantiate = false, reader: readerName, parser: parserName } = options,
			reader = await this.getReaderOf( file, {
				reader: readerName,
				instantiate: true,
			} ),
			prepare = async ( parser ) => {
				return await parser.validate( reader ) &&
					( instantiate ? new parser( reader ) : parser );
			},
			parsers = this.getParsers( reader.constructor.getName() );

		if ( reader ) {
			if ( parserName ) {
				const parser = parsers[ parserName ];

				if ( parser ) {
					return await prepare( parser );
				}
			} else {
				for ( const parser of Object.values( parsers ) ) {
					const prepared = await prepare( parser );

					if ( prepared ) {
						return prepared;
					}
				}
			}
		}

		return false;
	}

	/**
	 * Resolve the mime-type for an input using the registered parsers.
	 *
	 * @param input
	 * @returns {Promise<string|boolean>}
	 */
	async getMimeTypeOf( input ) {
		for ( const reader of Object.values( this.getReaders() ) ) {
			const mimeType = await reader.resolve( input );

			if ( mimeType ) {
				return mimeType;
			}
		}

		return false;
	}

	/**
	 * Get the Normalizer instance.
	 *
	 * @returns {Normalizer}
	 */
	getNormalizer() {
		return this.normalizer;
	}

	/**
	 * Get all registered file-readers.
	 *
	 * @returns {[]}
	 */
	getReaders() {
		return this.readers;
	}

	/**
	 * Get all registered file-parsers, unless a reader name is specified, in which case its parsers are returned.
	 *
	 * @param readerName
	 * @returns {FileParserBase[]}
	 */
	getParsers( readerName = null ) {
		return readerName ?
			this.parsers[ readerName ] :
			this.parsers;
	}
}
