export default class Session {
	/**
	 * Session constructor.
	 *
	 * @param files
	 * @param target
	 * @param options
	 */
	constructor( files, target, options = {} ) {
		this.files = files;
		this.target = target;
		this.options = options;
	}

	/**
	 * Validate all files can be handled.
	 *
	 * @returns {boolean}
	 */
	validate() {
		for ( const file of this.getFiles() ) {
			if ( ! FileHandlerRegistrar.getHandlerOf( file ) ) {
				return false;
			}
		}

		return true;
	}

	/**
	 * Handle all files and invoke their 'apply' method to fulfill their purpose.
	 */
	apply() {
		for ( const file of this.getFiles() ) {
			const handler = FileHandlerRegistrar.getHandlerOf( file );

			new handler( this, file )
				.handle();
		}
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
	 * Get the session FileList object.
	 *
	 * @returns {FileList}
	 */
	getFileList() {
		return this.files;
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
	 * Get the session options.
	 *
	 * @returns {{}}
	 */
	getOptions() {
		return this.options;
	}
}
