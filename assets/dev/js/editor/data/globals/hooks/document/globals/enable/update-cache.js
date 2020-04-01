import After from 'elementor-api/modules/hooks/data/after';
import DocumentCache from 'elementor-editor/data/globals/helpers/document-cache';

export class GlobalsEnableUpdateCache extends After {
	getCommand() {
		return 'document/globals/enable';
	}

	getConditions( args, result ) {
		// TODO: Remove - Create testing compatibility.
		return ! elementorCommonConfig.isTesting;
	}

	getId() {
		return 'document/globals/enable::update-cache'; // TODO: I think better to use this format.
	}

	apply( args ) {
		DocumentCache.updateFromContainers( args );
	}
}

export default GlobalsEnableUpdateCache;
