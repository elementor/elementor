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
		const { activeControl } = args;

		if ( ! activeControl || '' === activeControl ) {
			elementor.getPanelView().setPage( 'page_settings' ).activateTab( tab );
		}

		this.activateControl( activeControl );
	}

	getTabsWrapperSelector() {
		return '.elementor-panel-navigation';
	}
}
