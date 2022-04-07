import Deprecation from './deprecation';

export default class extends elementorModules.editor.utils.Module {
	deprecation = Deprecation;

	notifyBackendDeprecations() {
		// eslint-disable-next-line camelcase
		const notices = elementor.config.dev_tools.deprecation.soft_notices;

		Object.entries( notices ).forEach( ( [ key, notice ] ) => {
			elementorCommon.helpers.softDeprecated( key, ...notice );
		} );
	}

	onElementorLoaded() {
		this.notifyBackendDeprecations();
	}
}
