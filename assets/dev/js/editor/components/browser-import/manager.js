import SessionBuilder from './session-builder';
import Normalizer from './normalizer';
import DefaultConfig from './default-config';

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
	 * Register a new file-parser.
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
	getReaderOf( file ) {
		for ( const reader of Object.values( this.getReaders() ) ) {
			if ( reader.validate( file ) ) {
				return reader;
			}
		}

		return false;
	}

	getParserOf( reader, file ) {
		if ( this.readers[ reader.getName() ] ) {
			for ( const parser of Object.values( this.parsers[ reader.getName() ] ) ) {
				if ( parser.validate( file ) ) {
					return parser;
				}
			}
		}

		return false;
	}

	getMimeTypeOf( input ) {
		for ( const reader of Object.values( this.getReaders() ) ) {
			const mimeType = reader.class.resolve( input );

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
	 * Get all registered file-parsers, unless a reader name is specified and only its parsers are returned.
	 *
	 * @returns {[]}
	 */
	getParsers( reader = null ) {
		if ( reader ) {
			return this.parsers[ reader ];
		}

		return this.parsers;
	}
}
