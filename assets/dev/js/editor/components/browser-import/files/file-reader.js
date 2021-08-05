/**
 * @abstract
 */
export default class FileReader {
	/**
	 * @abstract
	 * @returns {string}
	 */
	static getName() {
		return '';
	}

	/**
	 * Each file-reader supports one or more mime-types, that are listed in this method. Therefore, this static
	 * method considered abstract, and has to be implemented on each and every file-reader.
	 *
	 * @abstract
	 * @returns {[]}
	 */
	static get mimeTypes() {
		return [];
	}

	/**
	 * If the file-reader supports input that's received without an explicit mime-type (such as strings or
	 * JavasScript objects), here it has to check whether it belongs and eventually determine and return the
	 * suitable mime-type.
	 *
	 * @abstract
	 * @param input
	 * @returns {string|boolean}
	 */
	static resolve( input ) {
		return false;
	}

	/**
	 * Validate that a file is compatible with the file-reader mime-types.
	 *
	 * @param file
	 */
	static validate( file ) {
		if ( ! this.validator ) {
			this.validator = new RegExp( this.mimeTypes.join( '|' ), 'i' );
		}

		return this.validator.test( file.type );
	}
}
