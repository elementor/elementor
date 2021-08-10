export default class Session {
	/**
	 * Session constructor.
	 *
	 * @param manager
	 * @param files
	 * @param target
	 * @param options
	 */
	constructor( manager, files = null, target = null, options = {} ) {
		this.manager = manager;

		this.setFileList( files );
		this.setOptions( options );

		this.setTarget( target );
	}

	/**
	 * Validate all files in this session can be handled.
	 *
	 * @returns {boolean}
	 */
	async validate() {
		for ( const file of this.getFiles() ) {
			if ( ! await this.manager.getReaderOf( file ) ) {
				return false;
			}
		}

		return true;
	}

	/**
	 * Match files to a suitable reade
	 */
	async apply() {
		const result = [];

		for ( const file of this.getFiles() ) {
			const reader = await this.manager.getReaderOf( file );

			if ( reader ) {
				const readerInstance = new reader( this, file ),
					parser = await this.manager.getParserOf( file, readerInstance );

				if ( parser ) {
					result.push(
						new parser( this, readerInstance )
							.parse()
					);

					continue;
				}
			}

			throw new Error( 'An error occurred when trying to parse the input' );
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
	 * Set the session Target object, and apply its options.
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
