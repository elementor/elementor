export default class DocumentCache {
	static deleteById( documentId, elementId ) {
		$e.data.deleteCache(
			'document/elements',
			{
				document_id: documentId,
				element_id: elementId,
			},
		);
	}

	static updateByModel( documentId, model ) {
		if ( ! model.id ) {
			throw Error( 'Invalid model.id' );
		}

		// Add cache.
		$e.data.loadCache(
			'document/elements',
			{
				document_id: documentId,
				element_id: model.id,
			},
			model,
		);
	}

	static updateByConfig( document ) {
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
			DocumentCache.updateByModel( document.id, element )
		);
	}

	static updateByContainers( containers = null, settings = null ) {
		containers.forEach( ( container ) => {
			const element = container.model.toJSON();

			delete element.defaultEditSettings;
			delete element.editSettings;

			if ( settings ) {
				element.settings = Object.assign( element.settings, settings );
			}

			// Update cache.
			DocumentCache.updateByModel( elementor.documents.getCurrent().id, element );
		} );
	}
}
