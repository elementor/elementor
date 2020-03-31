import After from 'elementor-api/modules/hooks/data/after';
import CacheHelper from '../../cache-helper';

export class ElementsCreateUpdateCache extends After {
	getCommand() {
		return 'document/elements/create';
	}

	getConditions( args, result ) {
		return ! elementorCommonConfig.isTesting;
	}

	getId() {
		return 'document/elements/create::update-cache';
	}

	apply( args, containers ) {
		if ( ! Array.isArray( containers ) ) {
			containers = [ containers ];
		}

		CacheHelper.updateDocumentElements( args, containers );

		if ( args.columns ) {
			// Cache columns since if they created by 'create-section' - hook.
			const columnsContainers = [];
			containers.forEach( ( container ) => {
				Object.values( container.view.children._views ).map( ( _view ) => {
					columnsContainers.push( _view.getContainer() );
				} );
			} );
			CacheHelper.updateDocumentElements( args, columnsContainers );
		}
	}
}

export default ElementsCreateUpdateCache;
