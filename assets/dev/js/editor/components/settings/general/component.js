export default class extends elementorModules.Component {
	init( args ) {
		this.title = 'Global Settings';
		this.namespace = 'panel/general-settings';

		super.init( args );
	}

	activateTab( tab ) {
		elementor.getPanelView().setPage( 'general_settings' ).activateTab( tab )._renderChildren();
	}

	getTabs() {
		return {
			style: elementor.translate( 'style' ),
			lightbox: elementor.translate( 'lightbox' ),
		};
	}
}
