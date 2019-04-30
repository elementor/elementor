export default class extends elementorModules.Component {
	init( args ) {
		this.title = 'Actions';
		this.namespace = 'panel/history/actions';

		super.init( args );
	}

	getCommands() {
		return {
			undo: () => this.view.navigate(),
			redo: () => this.view.navigate( true ),
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
