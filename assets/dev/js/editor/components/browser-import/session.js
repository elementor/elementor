export default class Session {
	/**
	 * Session constructor.
	 *
	 * @param files
	 * @param target
	 * @param options
	 */
	constructor( manager, files = null, target = null, options = {} ) {
		this.manager = manager;

		this.setFileList( files );
		this.setTarget( target );
		this.setOptions( options );
	}

	/**
	 * Validate all files can be handled.
	 *
	 * @returns {boolean}
	 */
	validate() {
		for ( const file of this.getFiles() ) {
			if ( ! this.manager.getReaderOf( file ) ) {
				return false;
			}
		}

		return true;
	}

	/**
	 * Match files to a suitable reade
	 */
	apply() {
		const result = [];

		for ( const file of this.getFiles() ) {
			const reader = this.manager.getReaderOf( file ),
				parser = this.manager.getParserOf( reader, file );

			if ( parser ) {
				result.push(
					new parser( this, file, reader )
						.parse()
				);
			}
		}

		return result;
	}

	/**
	 * Get an array of the session files.
	 *
	 * @returns {File[]}
	 */
	getFiles() {
		return Array.from( this.files );
	}

	/**
	 * Set the session FileList object.
	 *
	 * @param files
	 */
	setFileList( files ) {
		this.files = files;
	}

	/**
	 * Get the session FileList object.
	 *
	 * @returns {FileList}
	 */
	getFileList() {
		return this.files;
	}

	/**
	 * Set the session Target object.
	 *
	 * @param target
	 */
	setTarget( target ) {
		this.target = target;
	}

	/**
	 * Get the session target.
	 *
	 * @returns {*}
	 */
	getTarget() {
		return this.target;
	}

	/**
	 * Set the session options.
	 *
	 * @param options
	 * @returns this
	 */
	setOptions( options ) {
		this.options = options;
	}

	/**
	 * Get the session options.
	 *
	 * @returns {{}}
	 */
	getOptions() {
		return this.options;
	}
}
