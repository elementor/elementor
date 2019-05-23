export default class extends elementorModules.Component {
	getNamespace() {
		return 'panel/history/revisions';
	}

	getCommands() {
		return {
			up: () => this.navigate( true ),
			down: () => this.navigate(),
		};
	}

	getShortcuts() {
		return {
			up: {
				keys: 'up',
				scope: [ this.getNamespace() ],
			},
			down: {
				keys: 'down',
				scope: [ this.getNamespace() ],
			},
		};
	}

	navigate( up ) {
		if ( this.context.getItems().length > 1 ) {
			elementor.getPanelView().getCurrentPageView().currentTab.navigate( up );
		}
	}
}
