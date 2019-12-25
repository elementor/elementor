import BaseComponent from 'elementor-api/modules/component';

export default class Component extends BaseComponent {
	getNamespace() {
		return 'panel/history';
	}

	defaultTabs() {
		return {
			actions: { title: elementor.translate( 'actions' ) },
			revisions: { title: elementor.translate( 'revisions' ) },
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
