export default class extends elementorModules.Component {
	constructor( ...args ) {
		super( ...args );

		this.title = 'Global Settings';
		this.namespace = 'panel/general-settings';
	}

	activateTab( tab ) {
		elementor.getPanelView().setPage( 'general_settings' ).activateTab( tab );
		super.activateTab( tab );
	}

	getTabs() {
		return {
			style: elementor.translate( 'style' ),
			lightbox: elementor.translate( 'lightbox' ),
		};
	}
}
