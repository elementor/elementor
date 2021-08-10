import FileParser from '../../file-parser';

export class Widget extends FileParser {
	/**
	 * @inheritDoc
	 */
	static getName() {
		return 'widget';
	}

	/**
	 * @inheritDoc
	 */
	async parse() {
		const file = this.reader.getFile();

		return $e.data.run( 'create', 'wp/media', { file, options: {} } )
			.then( ( { data: result } ) => {
				this.session.getTarget().createElement( 'image', {
					settings: {
						image: {
							url: result.source_url,
							id: result.id,
							alt: file.name.split( '.' )[ 0 ],
							source: 'library',
						},
					},
				} );
			} );
	}

	/**
	 * @inheritDoc
	 */
	static async validate( reader ) {
		return true;
	}
}
