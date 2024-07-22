import Component from './component';
import DefaultConfig from './default-config';
import ItemCollection from 'elementor-editor/components/browser-import/items/item-collection';
import Normalizer from './normalizer';
import Session from 'elementor-editor/components/browser-import/session';

/**
 * @typedef {import('../../container/container')} Container
 */
/**
 * @typedef {import('./files/file-reader-base')} FileReaderBase
 */
/**
 * @typedef {import('./files/file-parser-base')} FileParserBase
 */

export default class Manager extends elementorModules.editor.utils.Module {
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
	constructor() {
		super();

		this.normalizer = new Normalizer( this );

		$e.components.register(
			new Component( { manager: this } ),
		);

		this.parseConfig( DefaultConfig );
	}

	/**
	 * Parse the config for the Manager.
	 *
	 * @param {*} config
	 */
	parseConfig( config = {} ) {
		for ( const reader of config.readers || {} ) {
			const isActive = reader.isActive?.() ?? true;

			if ( isActive ) {
				this.registerFileReader( reader );
			}
		}

		for ( const parser of config.parsers || {} ) {
			this.registerFileParser( parser );
		}
	}

	/**
	 * Create a new Session instance and normalize input if needed.
	 *
	 * @param {*}              input
	 * @param {Container|null} target
	 * @param {{}}             options
	 * @return {Session} session
	 */
	async createSession( input, target, options = {} ) {
		if ( ! ( input instanceof ItemCollection ) ) {
			input = await this.getNormalizer().normalize( input );
		}

		return new Session( this, input, target, options );
	}

	/**
	 * Register a new file-reader.
	 *
	 * @param {{}} reader
	 */
	registerFileReader( reader ) {
		this.readers[ reader.getName() ] = reader;
	}

	/**
	 * Register a new file-parser.
	 *
	 * @param {*} parser
	 */
	registerFileParser( parser ) {
		for ( const readerName of parser.getReaders() ) {
			if ( ! this.readers[ readerName ] ) {
				continue;
			} else if ( ! this.parsers[ readerName ] ) {
				this.parsers[ readerName ] = {};
			}

			this.parsers[ readerName ][ parser.getName() ] = parser;
		}
	}

	/**
	 * Get the file-handler that can handle the File of the given Item.
	 *
	 * @param {*}       item
	 * @param {boolean} instantiate
	 * @return {FileReaderBase|boolean} file handler
	 */
	async getReaderOf( item, instantiate = false ) {
		const file = item.getFile(),
			readerName = item.getReader(),
			readers = this.getReaders( readerName );

		for ( const reader of Object.values( readers ) ) {
			if ( await reader.validate( file ) ) {
				if ( ! readerName ) {
					item.setReader( reader.getName() );
				}

				return instantiate ? new reader( file ) : reader;
			}
		}

		return false;
	}

	/**
	 * Get the file-parser that can handle the File of the given Item.
	 *
	 * @param {*}       item
	 * @param {boolean} instantiate
	 * @return {Promise<FileParserBase|boolean>} file parser
	 */
	async getParserOf( item, instantiate = false ) {
		const reader = await this.getReaderOf( item, true ),
			parserName = item.getParser();

		if ( reader ) {
			const parsers = this.getParsers(
				reader.constructor.getName(),
				parserName,
			);

			for ( const parser of Object.values( parsers ) ) {
				if ( await parser.validate( reader ) ) {
					if ( ! parserName ) {
						item.setParser( parser.getName() );
					}

					return instantiate ? new parser( reader ) : parser;
				}
			}
		}

		return false;
	}

	/**
	 * Resolve the mime-type for an input using the registered parsers.
	 *
	 * @param {*} input
	 * @return {Promise<string|boolean>} mime type, or false if not found
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
	 * @return {Normalizer} normalizer
	 */
	getNormalizer() {
		return this.normalizer;
	}

	/**
	 * Get all registered file-readers.
	 *
	 * @param {*|Array<*>} readers
	 * @return {{}} registered file readers
	 */
	getReaders( readers = [] ) {
		readers = Array.isArray( readers ) ? readers : [ readers ];

		if ( ! readers.length ) {
			return this.readers;
		}

		return Object.fromEntries(
			readers.filter( ( reader ) => reader in this.readers )
				.map( ( reader ) => [ reader, this.readers[ reader ] ] ),
		);
	}

	/**
	 * Get all registered file-parsers, unless a reader name is specified, in which case its parsers are returned.
	 *
	 * @param {*} reader
	 * @param {*} parsers
	 * @return {{}} parsers
	 */
	getParsers( reader, parsers = [] ) {
		parsers = Array.isArray( parsers ) ? parsers : [ parsers ];

		if ( ! parsers.length ) {
			return this.parsers[ reader ] || {};
		}

		return Object.fromEntries(
			parsers.filter( ( parser ) => parser in this.parsers[ reader ] )
				.map( ( parser ) => [ parser, this.parsers[ reader ][ parser ] ] ),
		);
	}
}
