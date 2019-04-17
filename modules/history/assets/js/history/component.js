export default class extends elementorModules.Component {
	getRoutes() {
		return {
			actions: () => elementor.getPanelView().setPage( 'historyPage' ).activateTab( 'actions' ),
		};
	}

	getCommands() {
		return {
			undo: () => this.view.navigate(),
			redo: () => this.view.navigate( true ),
		};
	}

	getShortcuts() {
		return {
			actions: {
				keys: 'ctrl+shift+h',
				scope: [ 'global' ],
			},
			undo: {
				keys: 'ctrl+z',
				exclude: [ 'input' ],
				scope: [ 'preview', 'panel' ],
			},
			redo: {
				keys: 'ctrl+shift+z, ctrl+y',
				exclude: [ 'input' ],
				scope: [ 'preview', 'panel' ],
			},
		};
	}
}
