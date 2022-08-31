import ContainerFactory from '../../../container-factory';
import { MediaParser } from '../base';

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

		this.upload( file ).then( ( { data } ) => {
			$e.internal( 'document/elements/set-settings', {
				// The reason we use the container id and not the container instance itself is that the container
				// created above is just a placeholder, which later recreated using the same id.
				container: elementor.getContainer( container.id ),
				settings: {
					hosted_url: {
						url: data.source_url,
						id: data.id,
					},
				},
			} );
		} ).catch( () => {
			elementor.documents.getCurrent().history.setActive( false );

			$e.run( 'document/elements/reset-settings', {
				container: elementor.getContainer( container.id ),
				options: { external: true },
			} );

			elementor.documents.getCurrent().history.setActive( true );
		} );

		return container;
	}

	/**
	 * @inheritDoc
	 */
	static async validate() {
		return true;
	}
}
