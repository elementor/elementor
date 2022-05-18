import isInstanceof from '../../../utils/is-instanceof';
import Mime from 'mime';

export default class Item {
	/**
	 * The item File object.
	 *
	 * @type {File}
	 */
	file;

	/**
	 * The Item options list.
	 *
	 * @type {{}}
	 */
	options = {};

	/**
	 * The Item constructor.
	 *
	 * @param input
	 * @param options
	 */
	constructor( input, options = {} ) {
		this.file = this.toFile( input );
		this.options = options;
	}

	/**
	 * Convert the input into a File object.
	 *
	 * @param input
	 * @returns {File}
	 */
	toFile( input ) {
		if ( ! isInstanceof( input, File ) ) {
			const { fileName, type } = this.options,
				options = { type: type || input.type };

			// When the input is not a Blob object, use the mime-type from the options to generate the file.
			input = new File(
				Array.isArray( input ) ? input : [ input ],
				fileName || this.constructor.createFileName( options ),
				options
			);
		}

		return input;
	}

	/**
	 * Create a random file name from a Blob/File object while using the suitable extension for the blob mime-type.
	 *
	 * @param blob
	 * @returns {string}
	 */
	static createFileName( blob ) {
		return [
			elementorCommon.helpers.getUniqueId(),
			Mime.getExtension( blob.type ),
		].join( '.' );
	}

	/**
	 * Get the item File object.
	 *
	 * @returns {File}
	 */
	getFile() {
		return this.file;
	}

	/**
	 * Get the file-reader of the Item.
	 *
	 * @returns {FileReaderBase}
	 */
	getReader() {
		return this.options.reader;
	}

	/**
	 * Get the file-parser of the Item.
	 *
	 * @returns {FileParserBase}
	 */
	getParser() {
		return this.options.parser;
	}

	/**
	 * Set the file-reader of the Item.
	 *
	 * @param reader
	 */
	setReader( reader ) {
		this.options.reader = reader;
	}

	/**
	 * Set the file-parser of the Item.
	 *
	 * @param parser
	 */
	setParser( parser ) {
		this.options.parser = parser;
	}
}
