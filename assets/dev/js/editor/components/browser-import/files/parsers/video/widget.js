import FileParserBase from '../../file-parser-base';
import ContainerFactory from '../../../container-factory';

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
		return [ 'video' ];
	}

	/**
	 * @inheritDoc
	 */
	async parse() {
		const file = this.reader.getFile(),
			{ data: result } = await $e.data.run( 'create', 'wp/media', { file, options: {} } );

		return ContainerFactory.createElementContainer( {
			widgetType: 'video',
			settings: {
				video_type: 'hosted',
				hosted_url: {
					url: result.source_url,
					id: result.id,
					alt: file.name.split( '.' )[ 0 ],
					source: 'library',
				},
			},
		} );
	}

	/**
	 * @inheritDoc
	 */
	static async validate( reader ) {
		return true;
	}
}
