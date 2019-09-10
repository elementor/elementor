export default class extends elementorModules.common.Component {
	getNamespace() {
		return 'panel/history/actions';
	}

	defaultCommands() {
		return {
			undo: () => this.manager.navigate(),
			redo: () => this.manager.navigate( true ),
		};
	}

	defaultShortcuts() {
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
