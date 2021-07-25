class FileHandlerRegistrar {
	/**
	 * Register a new file-handler.
	 *
	 * @param name
	 * @param handler
	 */
	static register( name, handler ) {
		if ( ! this.handlers ) {
			this.handlers = [];
		}

		this.handlers.push( name, handler );
	}

	/**
	 * Get the FileHandle object that can handle the given file.
	 *
	 * @param file
	 * @returns {boolean}
	 */
	static getHandlerOf( file ) {
		for ( const handler of this.registered ) {
			if ( handler.validate( file ) ) {
				return true;
			}
		}

		return false;
	}

	/**
	 * Get all registered file-handlers.
	 *
	 * @returns {FileHandler[]}
	 */
	static get registered() {
		return this.handlers;
	}
}
