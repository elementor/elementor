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
	}
}

export default ElementsCreateUpdateCache;
