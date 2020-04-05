import UpdateCacheBase from '../base/update-cache-base';

export class GlobalsSettingsUpdateCache extends UpdateCacheBase {
	getCommand() {
		return 'document/globals/settings';
	}

	getId() {
		return 'document/globals/settings::update-cache';
	}
}

export default GlobalsSettingsUpdateCache;
