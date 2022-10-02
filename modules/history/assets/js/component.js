import ComponentBase from 'elementor-api/modules/component-base';

export default class Component extends ComponentBase {
	getNamespace() {
		return 'panel/history';
	}

	defaultTabs() {
		return {
			actions: { title: __( 'Actions', 'elementor' ) },
			revisions: { title: __( 'Revisions', 'elementor' ) },
		};
	}

	defaultShortcuts() {
		return {
			actions: {
				keys: 'ctrl+shift+h',
			},
		};
	}

	renderTab( tab ) {
		elementor.getPanelView().setPage( 'historyPage' ).showView( tab );
	}

	activate() {
		// Activate the tab component itself.
		$e.components.activate( this.getTabRoute( this.currentTab ) );
	}

	getTabsWrapperSelector() {
		return '#elementor-panel-elements-navigation';
	}
}
