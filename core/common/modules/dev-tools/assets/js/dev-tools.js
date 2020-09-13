export default class extends elementorModules.Module {
	constructor() {
		super();

		elementorCommon.elements.$window.on( 'elementor:loaded', this.onElementorLoaded.bind( this ) );
	}

	onElementorLoaded() {
		const notices = elementorCommon.config.devTools.deprecation.notices;

		if ( notices?.length ) {
			notices.forEach( ( notice ) => {
				elementorCommon.helpers.softDeprecated( ... notice );
			} );
		}
	}
}
