/**
 * TODO: Try remove the file or content as more as possible.
 * try to manipulate cache using only $e.data.
 */

export default class DocumentCache {
	static updateSettingsByContainers( containers, mergeSettings = null ) {
		containers.forEach( ( container ) => {
			const documentId = container.document.id,
				elementId = container.id,
				component = $e.components.get( 'editor/documents' ),
				command = 'editor/documents/elements',
				data = $e.data.getCache( component, command, {
					documentId,
					elementId,
				} );

			if ( data.settings && mergeSettings ) {
				data.settings = Object.assign( data.settings, mergeSettings );
			}

			if ( ! data.settings ) {
				data.settings = container.settings.toJSON();
			}

			$e.data.updateCache( component, command, {
				documentId,
				elementId,
			}, data );
		} );
	}
}
