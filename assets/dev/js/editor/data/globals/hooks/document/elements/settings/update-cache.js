import After from 'elementor-api/modules/hooks/data/after';
import CacheHelper from '../../cache-helper';

export class ElementsSettingsUpdateCache extends After {
	getCommand() {
		return 'document/elements/settings';
	}

	getConditions( args, result ) {
		// TODO: Remove - Create testing compatibility.
		return ! elementorCommonConfig.isTesting;
	}

	getId() {
		return 'document/elements/settings::update-cache';
	}

	apply( args ) {
		CacheHelper.updateDocumentElements( args, null, args.settings );
	}
}

export default ElementsSettingsUpdateCache;
