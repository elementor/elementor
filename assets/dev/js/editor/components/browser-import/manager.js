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
	 * @param instantiate
	 * @returns {FileReaderBase|boolean}
	 */
	async getReaderOf( file, instantiate = false ) {
		for ( const reader of Object.values( this.getReaders() ) ) {
			if ( await reader.validate( file ) ) {
				return instantiate ? new reader( file ) : reader;
			}
		}

		return false;
	}

	/**
	 * Get the file-parser that can handle the given file.
	 *
	 * @param file
	 * @param instantiate
	 * @returns {Promise<FileParserBase|boolean>}
	 */
	async getParserOf( file, instantiate = false ) {
		const reader = await this.getReaderOf( file, true ),
			parsers = this.getParsers( reader.constructor.getName() );

		for ( const parser of Object.values( parsers ) ) {
			if ( await parser.validate( reader ) ) {
				return instantiate ? new parser( reader ) : parser;
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
