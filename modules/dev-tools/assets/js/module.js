import Deprecation from './deprecation';

/* global elementorDevToolsConfig */

export default class Module {
	constructor() {
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
		const style = `font-size: 12px; background-image: url("${ elementorDevToolsConfig.urls.assets }images/logo-icon.png"); background-repeat: no-repeat; background-size: contain;`;

		args.unshift( '%c  %c', style, '' );

		console.warn( ...args ); // eslint-disable-line no-console
	}
}

if ( ! window.elementorDevTools ) {
	window.elementorDevTools = new Module();
	window.elementorDevTools.deprecation = new Deprecation();
}
