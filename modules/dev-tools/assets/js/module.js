import Deprecation from './deprecation';
import { consoleWarn } from './utils';

/* global elementorDevToolsConfig */

export default class Module {
	constructor() {
		this.deprecation = new Deprecation();

		this.notifyBackendDeprecations();
	}

	notifyBackendDeprecations() {
		// eslint-disable-next-line camelcase
		const notices = elementorDevToolsConfig.deprecation.soft_notices;

		Object.entries( notices ).forEach( ( [ key, notice ] ) => {
			this.deprecation.deprecated( key, ...notice );
		} );
	}

	consoleWarn( ...args ) {
		consoleWarn( ...args );
	}
}

