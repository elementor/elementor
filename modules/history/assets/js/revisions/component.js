export default class extends elementorModules.Component {
	init( args ) {
		this.title = 'Revisions';
		this.namespace = 'panel/history/revisions';

		super.init( args );
	}

	getCommands() {
		return {
			up: () => this.parent.navigate( up ),
			down: () => this.parent.navigate(),
		};
	}

	getShortcuts() {
		return {
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
