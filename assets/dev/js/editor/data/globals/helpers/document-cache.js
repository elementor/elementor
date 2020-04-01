export default class DocumentCache {
	static updateFromConfig( document ) {
		// TODO: Find better place for `getFlatElements`.
		const getFlatElements = ( _elements ) => {
			const result = [];
			_elements.forEach( ( element ) => {
				if ( element.elements ) {
					getFlatElements( element.elements ).forEach( ( _element ) => result.push( _element ) );
				}

				result.push( element );
			} );
			return result;
		};

		getFlatElements( document.config.elements ).forEach( ( element ) =>
			// Add cache.
			$e.utils.data.cache(
				'document/elements',
				{
					document_id: document.id,
					element_id: element.id,
				},
				element
			)
		);
	}

	static updateFromContainers( args, containers = null, settings = null ) {
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
