import FileParserBase from '../../file-parser-base';

export class Widget extends FileParserBase {
	/**
	 * @inheritDoc
	 */
	static getName() {
		return 'widget';
	}

	/**
	 * @inheritDoc
	 */
	static getReaders() {
		return [ 'image' ];
	}

	/**
	 * @inheritDoc
	 */
	async parse() {
		const file = this.reader.getFile(),
			{ data: result } = $e.data.run( 'create', 'wp/media', { file, options: {} } );

		return [
			this.createContainer( {
				type: 'widget',
				settings: {
					image: {
						url: result.source_url,
						id: result.id,
						alt: file.name.split( '.' )[ 0 ],
						source: 'library',
					},
				},
			} ),
		];
	}

	/**
	 * @inheritDoc
	 */
	static async validate( reader ) {
		return true;
	}
}
