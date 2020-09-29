export default class extends elementorModules.editor.utils.Module {
	onElementorLoaded() {
		// eslint-disable-next-line camelcase
		const notices = elementor.config.dev_tools?.deprecation.soft_notices;

		if ( notices?.length ) {
			notices.forEach( ( notice ) => {
				elementorCommon.helpers.softDeprecated( ... notice );
			} );
		}
	}
}
