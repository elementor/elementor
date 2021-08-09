import SessionBuilder from './session-builder';
import Normalizer from './normalizer';
import FileReader from './files/file-reader';
import FileParser from './files/file-parser';

export default class Manager {
	/**
	 * Manager constructor.
	 */
	constructor( config = {} ) {
		this.parseConfig( config );

		this.normalizer = new Normalizer( this );
	}

	parseConfig( config = {} ) {
		for ( const [ readerName, reader ] of Object.entries( config.readers ) ) {
			this.registerFileReader( readerName, reader );
		}

		for ( const [ readerName, parsers ] of Object.entries( config.parsers ) ) {
			for ( const [ parserName, parser ] of Object.entries( parsers ) ) {
				this.registerFileParser( readerName, parserName, parser );
			}
		}
	}

	/**
	 * Create a new SessionBuilder.
	 *
	 * @returns {SessionBuilder}
	 */
	createSession() {
		return new SessionBuilder( this );
	}

	/**
	 * Register a new file-reader.
	 *
	 * @param readerName
	 * @param reader
	 */
	registerFileReader( readerName, reader ) {
		if ( ! this.readers ) {
			this.readers = {};
		}

		this.readers[ readerName ] = reader;
	}

	/**
	 * Register a new file-parser to a specific reader.
	 *
	 * @param readerName
	 * @param parserName
	 * @param parser
	 */
	registerFileParser( readerName, parserName, parser ) {
		const reader = this.readers[ readerName ];

		if ( ! reader ) {
			throw new Error( `Reader ${ readerName } is not registered.` );
		} else if ( ! this.parsers ) {
			this.parsers = {};
		}

		if ( ! this.parsers[ readerName ] ) {
			this.parsers[ readerName ] = {};
		}

		this.parsers[ readerName ][ parserName ] = parser;
	}

	/**
	 * Get the file-handler that can handle the given file.
	 *
	 * @param file
	 * @returns {FileReader|boolean}
	 */
	async getReaderOf( file ) {
		for ( const reader of Object.values( this.getReaders() ) ) {
			if ( await reader.validate( file ) ) {
				return reader;
			}
		}

		return false;
	}

	/**
	 * Get the suitable parser for a file, according to its reader.
	 *
	 * @param file
	 * @param reader
	 * @returns {Promise<FileParser|boolean>}
	 */
	async getParserOf( file, reader ) {
		// This methods requires an instance of FileReader since the parser's `validate` method using it to check
		// whether it can handle the file.
		if ( reader instanceof FileReader ) {
			const parsers = Object.values(
				this.parsers[ reader.constructor.getName() ] || {}
			);

			for ( const parser of parsers ) {
				if ( await parser.validate( reader ) ) {
					return parser;
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
	 * @returns {FileParser[]}
	 */
	getParsers( reader = null ) {
		if ( reader ) {
			return this.parsers[ reader ];
		}

		return this.parsers;
	}
}
