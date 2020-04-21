/**
 * TODO: Try remove the file or content as more as possible.
 * try to manipulate cache using only $e.data.
 */

export default class DocumentCache {
	static loadModel( documentId, model ) {
		if ( ! model.id ) {
			throw Error( 'Invalid model.id' );
		}

		$e.data.loadCache(
			'document/elements',
			{
				document_id: documentId,
				element_id: model.id,
			},
			model,
		);
	}

	static loadByConfig( document ) {
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
			DocumentCache.loadModel( document.id, element )
		);
	}

	static updateByContainers( containers, mergeSettings = null ) {
		containers.forEach( ( container ) => {
			const element = container.model.toJSON();

			delete element.defaultEditSettings;
			delete element.editSettings;

			if ( ! element.settings ) {
				throw Error( 'element settings is required.' );
			}

			if ( mergeSettings ) {
				element.settings = Object.assign( element.settings, mergeSettings );
			}

			$e.data.updateCache( 'document/elements', {
				document_id: elementor.documents.getCurrent().id,
				element_id: element.id,
			}, element );
		} );
	}

	static deleteByContainers( containers ) {
		containers.forEach( ( container ) => {
			$e.data.deleteCache( 'document/elements', {
				document_id: elementor.documents.getCurrent().id,
				element_id: container.id,
			} );
		} );
	}
}
