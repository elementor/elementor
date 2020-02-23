import ComponentBase from 'elementor-api/modules/component-base';

export default class Component extends ComponentBase {
	getNamespace() {
		return 'panel/history/actions';
	}

	defaultCommands() {
		return {
			do: ( args ) => $e.command( 'document/history/do', args ),
			undo: () => $e.command( 'document/history/undo' ),
			redo: () => $e.command( 'document/history/redo' ),
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
