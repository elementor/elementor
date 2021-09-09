export default class extends elementorModules.editor.utils.Module {
	onElementorLoaded() {
		this.notifyDeprecated();
	}

	notifyDeprecated() {
		// eslint-disable-next-line camelcase
		const notices = elementor.config.dev_tools.deprecation.soft_notices;

		Object.entries( notices ).forEach( ( [ key, notice ] ) => {
			elementorCommon.helpers.softDeprecated( key, ...notice );
		} );
	}
}
