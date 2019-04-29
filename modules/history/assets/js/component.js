export default class extends elementorModules.Component {
	activateTab( tab ) {
		elementor.getPanelView().setPage( 'historyPage' ).activateTab( tab );
	}

	getTabs() {
		return {
			actions: elementor.translate( 'actions' ),
			revisions: elementor.translate( 'revisions' ),
		};
	}

	getShortcuts() {
		return {
			actions: {
				keys: 'ctrl+shift+h',
				scope: [ 'global' ],
			},
			revisions: {
				keys: 'ctrl+shift+r',
				scope: [ 'global' ],
			},
		};
	}
}
