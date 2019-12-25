import BaseComponent from 'elementor-api/modules/component';

export default class Component extends BaseComponent {
	getNamespace() {
		return 'panel/page-settings';
	}

	defaultTabs() {
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
