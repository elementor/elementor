export default class extends elementorModules.Component {
	getNamespace() {
		return 'panel/history';
	}

	getTabs() {
		return {
			actions: { title: elementor.translate( 'actions' ) },
			revisions: { title: elementor.translate( 'revisions' ) },
		};
	}

	getShortcuts() {
		return {
			actions: {
				keys: 'ctrl+shift+h',
			},
			revisions: {
				keys: 'ctrl+shift+r',
			},
		};
	}

	getTabsWrapperSelector() {
		return '#elementor-panel-elements-navigation';
	}

	renderTab( tab ) {
		elementor.getPanelView().setPage( 'historyPage' ).showView( tab );
	}
}
