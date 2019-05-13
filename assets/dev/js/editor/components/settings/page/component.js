export default class extends elementorModules.Component {
	init( args ) {
		this.title = 'Page Settings';
		this.namespace = 'panel/page-settings';

		super.init( args );
	}

	getUIIndicator() {
		return '#elementor-panel-footer-settings';
	}

	activateTab( tab ) {
		elementor.getPanelView().setPage( 'page_settings' ).activateTab( tab );

		super.activateTab( tab );
	}

	getTabsWrapperSelector() {
		return '.elementor-panel-navigation';
	}

	getTabs() {
		return {
			settings: elementor.translate( 'settings' ),
			style: elementor.translate( 'style' ),
			advanced: elementor.translate( 'advanced' ),
		};
	}
}
