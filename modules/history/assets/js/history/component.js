export default class extends elementorModules.common.Component {
	getNamespace() {
		return 'panel/history/actions';
	}

	getCommands() {
		return {
			undo: () => this.manager.navigate(),
			redo: () => this.manager.navigate( true ),
		};
	}

	getShortcuts() {
		return {
			undo: {
				keys: 'ctrl+z',
				exclude: [ 'input' ],
				scopes: [ 'panel', 'navigator' ],
			},
			redo: {
				keys: 'ctrl+shift+z, ctrl+y',
				exclude: [ 'input' ],
				scopes: [ 'panel', 'navigator' ],
			},
		};
	}
}
