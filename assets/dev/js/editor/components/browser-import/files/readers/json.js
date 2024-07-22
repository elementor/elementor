import FileReaderBase from '../file-reader-base';

export class Json extends FileReaderBase {
	/**
	 * @inheritDoc
	 */
	static getName() {
		return 'json';
	}

	static isActive() {
		return elementor.config.user.is_administrator || ( elementor.config.user.restrictions?.includes( 'json-upload' ) ?? false );
	}

	/**
	 * @inheritDoc
	 */
	static get mimeTypes() {
		return [ 'application/json' ];
	}

	/**
	 * @inheritDoc
	 */
	static async resolve( input ) {
		try {
			JSON.parse( input );

			return 'application/json';
		} catch ( e ) {
			return false;
		}
	}

	/**
	 * Returns the file content as Json object.
	 *
	 * @return {{}} file content
	 */
	async getData() {
		if ( ! this._data ) {
			this._data = await this.getContent()
				.then( ( content ) => JSON.parse( content ) );
		}

		return this._data;
	}
}
