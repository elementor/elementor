export default class FileParser {
	/**
	 * FileParse constructor.
	 *
	 * @param session
	 * @param reader
	 */
	constructor( session, reader ) {
		this.session = session;
		this.reader = reader;
	}

	/**
	 * Get the file-parser name.
	 *
	 * @abstracts
	 * @returns {string}
	 */
	static getName() {
		return '';
	}

	/**
	 * Parse the the input as needed by this parser.
	 *
	 * @abstract
	 */
	async parse() {}

	/**
	 * Here parsers can validate that an input from a reader can be handled by the parser. This validation has to be
	 * very accurate and specific so if the parser can't handle the file for sure, the next parsers will have the
	 * opportunity to do so.
	 *
	 * @abstract
	 * @return {boolean}
	 */
	static async validate( reader ) {
		return false;
	}
}
