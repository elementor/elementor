/**
 * @abstract
 */
export default class FileReaderBase {
	/**
	 * The File instance.
	 *
	 * @type {File}
	 */
	file;

	/**
	 * FileReaderBase constructor.
	 *
	 * @param {File} file
	 */
	constructor( file ) {
		this.file = file;
	}

	/**
	 * Get the file-reader name.
	 *
	 * @abstract
	 * @return {string} name
	 */
	static getName() {
		return '';
	}

	/**
	 * Check if the reader is currently active.
	 *
	 * @abstract
	 * @return {boolean}
	 */
	static isActive() {
		return true;
	}

	/**
	 * Each file-reader can register the mime-types it supports in this method, so later a File object can be matched
	 * to it accordingly.
	 *
	 * @abstract
	 * @return {string[]} mime types
	 */
	static get mimeTypes() {
		return [];
	}

	/**
	 * If the file-reader supports an input that's received without an explicit mime-type (such as strings or JavasScript
	 * objects), here it can decide whether it can handle it and eventually return a suitable mime-type.
	 *
	 * @abstract
	 * @param {*} input
	 * @return {string|boolean} mime type
	 */
	static async resolve( input ) { // eslint-disable-line no-unused-vars
		return false;
	}

	/**
	 * Validate that a file can be handled by the file-reader, according to its mime-type.
	 *
	 * @param {File} file
	 */
	static async validate( file ) {
		if ( ! this.validator ) {
			this.validator = new RegExp(
				this.mimeTypes.join( '|' ),
				'i',
			);
		}

		return this.validator.test( file.type );
	}

	/**
	 * Get the file-reader File object.
	 *
	 * @return {*} file
	 */
	getFile() {
		return this.file;
	}

	/**
	 * Get the file-reader File object content as string.
	 *
	 * @return {Promise<string>} handler
	 */
	async getContent() {
		const fileReader = new FileReader(),
			handler = new Promise( ( resolve ) => {
				fileReader.onloadend = () => resolve( fileReader.result );
			} );

		fileReader.readAsText( this.getFile() );

		return handler;
	}

	/**
	 * Get the file-reader File object data url string.
	 *
	 * @return {Promise<string>} data URI
	 */
	async getDataUrl() {
		const fileReader = new FileReader(),
			handler = new Promise( ( resolve ) => {
				fileReader.onloadend = () => resolve( fileReader.result );
			} );

		fileReader.readAsDataURL( this.getFile() );

		return handler;
	}
}
