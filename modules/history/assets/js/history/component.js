export default class extends elementorModules.common.Component {
	getNamespace() {
		return 'panel/history/actions';
	}

	defaultCommands() {
		return {
			undo: () => $e.run( 'document/history/undo' ),
			redo: () => $e.run( 'document/history/redo' ),
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
