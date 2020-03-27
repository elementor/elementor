import After from 'elementor-api/modules/hooks/data/after';

export class AddCache extends After {
	getCommand() {
		return 'document/elements/create';
	}

	getId() {
		return 'add-cache';
	}

	apply( args, containers ) {
		if ( ! Array.isArray( containers ) ) {
			containers = [ containers ];
		}

		// For each created element.
		containers.forEach( ( container ) => {
			const element = container.model.toJSON();

			delete element.defaultEditSettings;
			delete element.editSettings;

			// Add cache.
			$e.data.create( 'document/elements', {
				document_id: elementor.documents.getCurrent().id,
				element_id: container.id,

				element,

				autoCache: true,
			} );
		} );
	}
}

export default AddCache;
