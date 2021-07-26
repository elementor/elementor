import FileHandler from '../file-handler';

export default class Image extends FileHandler {
	/**
	 * @inheritDoc
	 */
	async apply() {
		return $e.data( 'wp/media', { file: this.getFile() } )
			.then( ( result ) => {
				this.getSession().getTarget()
					.createWidget( 'image', {
						image: {
							url: result.source_url,
							id: result.id,
							alt: 'hello',
							source: 'library',
						},
					} );
			} );
	}

	/**
	 * @inheritDoc
	 */
	static get mimeTypes() {
		return [ 'image/*' ];
	}
}
