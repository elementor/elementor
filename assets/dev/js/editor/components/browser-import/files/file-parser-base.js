/**
 * @typedef {import('../../../container/container')} Container
 */
/**
 * @typedef {import('./file-reader-base')} FileReaderBase
 */

/**
 * @abstract
 */
export default class FileParserBase {
	/**
	 * The file-reader instance.
	 *
	 * @type {FileReaderBase}
	 */
	reader;

	/**
	 * Tasks to complete, even after parsing completed.
	 *
	 * @type {[]}
	 */
	tasks = [];

	/**
	 * FileParseBase constructor.
	 *
	 * @param {FileReaderBase} reader
	 */
	constructor( reader ) {
		this.reader = reader;
	}

	/**
	 * Get the file-parser name.
	 *
	 * @abstract
	 * @return {string} name
	 */
	static getName() {
		return '';
	}

	/**
	 * Get all readers the parser can handle with.
	 *
	 * @abstract
	 * @return {string[]} readers
	 */
	static getReaders() {
		return [];
	}

	/**
	 * Parse the the input as needed by this parser, and return Container objects to be processed.
	 *
	 * @abstract
	 * @return {Container[]} containers
	 */
	async parse() {}

	/**
	 * Here parsers can validate that an input from a reader can be handled by the parser. This validation has to be
	 * very accurate and specific so if the parser can't handle the file for sure, the next parsers will have the
	 * opportunity to do so.
	 *
	 * @param {*} reader
	 *
	 * @abstract
	 * @return {boolean} is valid
	 */
	static async validate( reader ) { // eslint-disable-line no-unused-vars
		return false;
	}
}
