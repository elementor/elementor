export default class extends elementorModules.Component {
	constructor( ...args ) {
		super( ...args );

		this.title = 'Actions';
		this.namespace = 'panel/history/actions';
	}

	getCommands() {
		return {
			undo: () => this.parent.navigate(),
			redo: () => this.parent.navigate( true ),
		};
	}

	getShortcuts() {
		return {
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
