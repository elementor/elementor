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
		return $e.data.run( 'create', 'wp/media', { file: this.getFile(), options: {} } )
			.then( ( { data: result } ) => {
				this.session.getTarget().createWidget( 'image', {
					image: {
						url: result.source_url,
						id: result.id,
						alt: this.getFile().name.split( '.' )[ 0 ],
						source: 'library',
					},
				} );
			} );
	}

	/**
	 * @inheritDoc
	 */
	static validate( file ) {
		return true;
	}
}
