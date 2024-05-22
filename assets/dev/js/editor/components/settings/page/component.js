import ComponentBase from 'elementor-editor/component-base';

export default class Component extends ComponentBase {
	getNamespace() {
		return 'panel/page-settings';
	}

	defaultTabs() {
		return {
			settings: { title: __( 'Settings', 'elementor' ) },
			style: { title: __( 'Style', 'elementor' ) },
			advanced: { title: __( 'Advanced', 'elementor' ) },
		};
	}

	renderTab( tab, args ) {
		const { activeControl, refresh = false } = args;

		if ( this.shouldRenderPage( tab ) || refresh ) {
			elementor.getPanelView().setPage( 'page_settings' ).activateTab( tab );
		}

		this.activateControl( activeControl );
	}

	shouldRenderPage( tab ) {
		const currentPanelView = elementor.getPanelView();

		const isSamePage = 'page_settings' === currentPanelView.getCurrentPageName();
		const isSameTab = tab === currentPanelView.getCurrentPageView()?.activeTab;

		return ! isSamePage || ! isSameTab;
	}

	getTabsWrapperSelector() {
		return '.elementor-panel-navigation';
	}
}
