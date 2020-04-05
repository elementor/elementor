import UpdateCacheBase from '../base/update-cache-base';

export class GlobalsDisableUpdateCache extends UpdateCacheBase {
	getCommand() {
		return 'document/globals/disable';
	}

	getId() {
		return 'document/globals/disable::update-cache';
	}
}

export default GlobalsDisableUpdateCache;
