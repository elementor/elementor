import MimeTypeValidator from './mime-type-validator';

/**
 * @abstract
 */
export default class FileHandler {
	/**
	 * FileHandler constructor.
	 *
	 * @param session
	 * @param file
	 */
	constructor( session, file ) {
		this.session = session;
		this.file = file;
	}

	/**
	 * Handle the file to fulfill it's purpose.
	 *
	 * @returns {Promise<*>}
	 */
	handle() {
		return Promise.resolve( this.apply() );
	}

	/**
	 * Each file-handler handles files differently using this method. Therefore, this method considered abstract,
	 * and has to be implemented on each and every file-handler.
	 *
	 * @abstract
	 */
	async apply() {}

	/**
	 * Each file-handler supports one or more mime-types, that are listed in this method. Therefore, this static
	 * method considered abstract, and has to be implemented on each and every file-handler.
	 *
	 * @abstract
	 * @returns {[]}
	 */
	static get mimeTypes() {
		return [];
	}

	/**
	 * Validate that a file is compatible with the file-handler mime-types.
	 *
	 * @param file
	 */
	static validate( file ) {
		if ( ! this.validator ) {
			this.validator = new MimeTypeValidator( this.mimeTypes );
		}

		return this.validator.validate( file.type );
	}
}
