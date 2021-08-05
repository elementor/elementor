export default class FileParser {
	/**
	 * FileParse constructor.
	 *
	 * @param session
	 * @param file
	 * @param reader
	 */
	constructor( session, file, reader ) {
		this.session = session;
		this.file = file;
		this.reader = reader;
	}

	/**
	 * @abstracts
	 * @returns {string}
	 */
	static getName() {
		return '';
	}

	/**
	 * @abstract
	 */
	async parse() {}

	/**
	 * @abstract
	 */
	static validate() {
		return false;
	}

	getFile() {
		return this.file;
	}

	getReader() {
		return this.reader;
	}
}
