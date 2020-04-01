import After from 'elementor-api/modules/hooks/data/after';
import DocumentCache from 'elementor-editor/data/globals/helpers/document-cache';

export class ElementsCreateUpdateCache extends After {
	getCommand() {
		return 'document/elements/create';
	}

	getConditions( args, result ) {
		// TODO: Remove - Create testing compatibility.
		return ! elementorCommonConfig.isTesting;
	}

	getId() {
		return 'document/elements/create::update-cache';
	}

	apply( args, containers ) {
		if ( ! Array.isArray( containers ) ) {
			containers = [ containers ];
		}

		DocumentCache.updateFromContainers( args, containers );

		if ( args.columns ) {
			// Cache columns manually, since they created by 'create-section' - hook.
			const columnsContainers = [];
			containers.forEach( ( container ) => {
				Object.values( container.view.children._views ).map( ( _view ) => {
					columnsContainers.push( _view.getContainer() );
				} );
			} );
			DocumentCache.updateFromContainers( args, columnsContainers );
		}
	}
}

export default ElementsCreateUpdateCache;
