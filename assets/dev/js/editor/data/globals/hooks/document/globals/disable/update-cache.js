import After from 'elementor-api/modules/hooks/data/after';
import CacheHelper from '../../cache-helper';

export class GlobalsDisableUpdateCache extends After {
	getCommand() {
		return 'document/globals/disable';
	}

	getConditions( args, result ) {
		return ! elementorCommonConfig.isTesting;
	}

	getId() {
		return 'document/globals/disable::update-cache'; // TODO: I think better to use this format.
	}

	apply( args ) {
		CacheHelper.updateDocumentElements( args );
	}
}

export default GlobalsDisableUpdateCache;
