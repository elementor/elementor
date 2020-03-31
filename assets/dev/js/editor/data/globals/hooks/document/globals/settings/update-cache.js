import After from 'elementor-api/modules/hooks/data/after';
import CacheHelper from '../../cache-helper';

export class GlobalsSettingsUpdateCache extends After {
	getCommand() {
		return 'document/globals/settings';
	}

	getConditions( args, result ) {
		return ! elementorCommonConfig.isTesting;
	}

	getId() {
		return 'document/globals/settings::update-cache'; // TODO: I think better to use this format.
	}

	apply( args ) {
		CacheHelper.updateDocumentElements( args );
	}
}

export default GlobalsSettingsUpdateCache;
