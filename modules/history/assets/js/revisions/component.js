export default class extends elementorModules.Component {
	getCommands() {
		return {
			up: () => this.view.navigate( up ),
			down: () => this.view.navigate(),
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
