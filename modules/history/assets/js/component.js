export default class extends elementorModules.common.Component {
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

	activate() {
		// Activate the tab component itself.
		$e.components.activate( this.getTabRoute( this.currentTab ) );
	}

	getTabsWrapperSelector() {
		return '#elementor-panel-elements-navigation';
	}

	renderTab( tab ) {
		elementor.getPanelView().setPage( 'historyPage' ).showView( tab );
	}
}
