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
				this.session.getTarget().createElement( 'video', {
					video_type: 'hosted',
					insert_url: 'yes',
					external_url: {
						url: result.source_url,
						is_external: '',
						nofollow: '',
						custom_attributes: '',
					}
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
