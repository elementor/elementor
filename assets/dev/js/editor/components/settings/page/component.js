export default class extends elementorModules.Component {
	init( args ) {
		this.title = 'Page Settings';
		this.namespace = 'panel/page-settings';

		super.init( args );
	}

	activateTab( tab ) {
		elementor.getPanelView().setPage( 'page_settings' ).activateTab( tab )._renderChildren();
	}

	getTabs() {
		return {
			settings: elementor.translate( 'settings' ),
			style: elementor.translate( 'style' ),
			advanced: elementor.translate( 'advanced' ),
		};
	}
}
