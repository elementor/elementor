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
	 * @param file
	 */
	constructor( file ) {
		this.file = file;
	}
	/**
	 * Get the file-reader name.
	 *
	 * @abstract
	 * @returns {string}
	 */
	static getName() {
		return '';
	}

	/**
	 * Each file-reader can register the mime-types it supports in this method, so later a File object can be matched
	 * to it accordingly.
	 *
	 * @abstract
	 * @returns {string[]}
	 */
	static get mimeTypes() {
		return [];
	}

	/**
	 * If the file-reader supports an input that's received without an explicit mime-type (such as strings or JavasScript
	 * objects), here it can decide whether it can handle it and eventually return a suitable mime-type.
	 *
	 * @abstract
	 * @param input
	 * @returns {string|boolean}
	 */
	static async resolve( input ) { // eslint-disable-line no-unused-vars
		return false;
	}

	/**
	 * Validate that a file can be handled by the file-reader, according to its mime-type.
	 *
	 * @param file
	 */
	static async validate( file ) {
		if ( ! this.validator ) {
			this.validator = new RegExp(
				this.mimeTypes.join( '|' ),
				'i'
			);
		}

		return this.validator.test( file.type );
	}

	/**
	 * Get the file-reader File object.
	 *
	 * @returns {*}
	 */
	getFile() {
		return this.file;
	}

	/**
	 * Get the file-reader File object content as string.
	 *
	 * @returns {Promise<string>}
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
	 * @returns {Promise<string>}
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
