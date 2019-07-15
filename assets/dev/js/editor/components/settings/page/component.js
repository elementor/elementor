export default class extends elementorModules.Component {
	getNamespace() {
		return 'panel/page-settings';
	}

	getInitialTabs() {
		return {
			settings: { title: elementor.translate( 'settings' ) },
			style: { title: elementor.translate( 'style' ) },
			advanced: { title: elementor.translate( 'advanced' ) },
		};
	}

	renderTab( tab ) {
		elementor.getPanelView().setPage( 'page_settings' ).activateTab( tab );
	}

	getTabsWrapperSelector() {
		return '.elementor-panel-navigation';
	}
}
