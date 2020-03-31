export default class CacheHelper {
	static updateDocumentElements( args, containers = null, settings = null ) {
		if ( ! containers ) {
			containers = args.containers || [ args.container ];
		}

		containers.forEach( ( container ) => {
			const element = container.model.toJSON();

			delete element.defaultEditSettings;
			delete element.editSettings;

			if ( settings ) {
				element.settings = Object.assign( element.settings, settings );
			}

			// Update cache.
			$e.utils.data.cache(
				'document/elements',
				{
					document_id: elementor.documents.getCurrent().id,
					element_id: container.id,
				},
				element
			);
		} );
	}
}
