import Deprecation from './deprecation';

/* global elementorDevToolsConfig */

export default class Module {
	/**
	 * @type {Deprecation}
	 */
	deprecation;

	constructor( deprecation ) {
		this.deprecation = deprecation;
	}

	notifyBackendDeprecations() {
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
