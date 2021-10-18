import ContainerFactory from '../../../container-factory';
import { MediaParser } from 'elementor-editor/components/browser-import/files/parsers/base';

export class Widget extends MediaParser {
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
			container = ContainerFactory.createElementContainer( {
				widgetType: 'video',
				settings: {
					video_type: 'hosted',
					hosted_url: {
						url: await this.reader.getDataUrl(),
						alt: file.name.split( '.' )[ 0 ],
						source: 'library',
					},
				},
			} );

		this.upload( file ).then( ( result ) => {
			$e.internal( 'document/elements/set-settings', {
				// The reason we use the container id and not the container instance itself is that the container
				// created above is just a placeholder, which later recreated using the same id.
				container: elementor.getContainer( container.id ),
				settings: {
					hosted_url: {
						url: result.data.source_url,
						id: result.data.id,
					},
				},
			} );
		} ).catch( () => {
			$e.run( 'document/elements/delete', {
				container: elementor.getContainer( container.id ),
			} );
		} );

		return container;
	}

	/**
	 * @inheritDoc
	 */
	static async validate( reader ) {
		return true;
	}
}
