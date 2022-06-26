import isInstanceof from '../../../utils/is-instanceof';
import Mime from 'mime';

/**
 * @typedef {import('../files/file-parser-base')} FileParserBase
 * @typedef {import('../files/file-reader-base')} FileReaderBase
 */

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
	 * @param {*} input
	 * @param {*} options
	 */
	constructor( input, options = {} ) {
		this.file = this.toFile( input );
		this.options = options;
	}

	/**
	 * Convert the input into a File object.
	 *
	 * @param {*} input
	 * @return {File} file
	 */
	toFile( input ) {
		if ( ! isInstanceof( input, File ) ) {
			const { fileName, type } = this.options,
				options = { type: type || input.type };

			// When the input is not a Blob object, use the mime-type from the options to generate the file.
			input = new File(
				Array.isArray( input ) ? input : [ input ],
				fileName || this.constructor.createFileName( options ),
				options,
			);
		}

		return input;
	}

	/**
	 * Create a random file name from a Blob/File object while using the suitable extension for the blob mime-type.
	 *
	 * @param {*} blob
	 * @return {string} file name
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
	 * @return {File} file
	 */
	getFile() {
		return this.file;
	}

	/**
	 * Get the file-reader of the Item.
	 *
	 * @return {FileReaderBase} reader
	 */
	getReader() {
		return this.options.reader;
	}

	/**
	 * Get the file-parser of the Item.
	 *
	 * @return {FileParserBase} parser
	 */
	getParser() {
		return this.options.parser;
	}

	/**
	 * Set the file-reader of the Item.
	 *
	 * @param {FileReaderBase} reader
	 */
	setReader( reader ) {
		this.options.reader = reader;
	}

	/**
	 * Set the file-parser of the Item.
	 *
	 * @param {FileParserBase} parser
	 */
	setParser( parser ) {
		this.options.parser = parser;
	}
}
