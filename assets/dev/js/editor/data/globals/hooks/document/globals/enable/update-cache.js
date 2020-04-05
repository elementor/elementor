import UpdateCacheBase from '../base/update-cache-base';

export class GlobalsEnableUpdateCache extends UpdateCacheBase {
	getCommand() {
		return 'document/globals/enable';
	}

	getId() {
		return 'document/globals/enable::update-cache';
	}
}

export default GlobalsEnableUpdateCache;
