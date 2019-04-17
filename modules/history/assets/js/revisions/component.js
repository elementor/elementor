export default class extends elementorModules.Component {
	getRoutes() {
		return {
			revisions: () => elementor.getPanelView().setPage( 'historyPage' ).activateTab( 'revisions' ),
		};
	}

	getCommands() {
		return {
			up: () => this.view.navigate( up ),
			down: () => this.view.navigate(),
		};
	}

	getShortcuts() {
		return {
			revisions: {
				keys: 'ctrl+shift+r',
				scope: 'global',
			},
			up: {
				keys: 'up',
				scope: 'component',
			},
			down: {
				keys: 'down',
				scope: 'component',
			},
		};
	}
}
