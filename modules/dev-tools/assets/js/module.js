import Deprecation from './deprecation';
import { consoleWarn } from './utils';
import { softDeprecated } from '../js/deprecation/utils';

/* global elementorDevToolsConfig */

export default class Module {
	constructor() {
		this.deprecation = new Deprecation( this );

		this.notifyBackendDeprecations();
	}

	notifyBackendDeprecations() {
		// eslint-disable-next-line camelcase
		const notices = elementorDevToolsConfig.deprecation.soft_notices;

		Object.entries( notices ).forEach( ( [ key, notice ] ) => {
			softDeprecated( key, ...notice );
		} );
	}
}

Module.prototype.consoleWarn = consoleWarn;

