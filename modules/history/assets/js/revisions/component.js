export default class extends elementorModules.Component {
	constructor( ...args ) {
		super( ...args );

		this.title = 'Revisions';
		this.namespace = 'panel/history/revisions';
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
				scope: [ this.namespace ],
			},
			down: {
				keys: 'down',
				scope: [ this.namespace ],
			},
		};
	}

	navigate( up ) {
		if ( this.parent.getItems().length > 1 ) {
			elementor.getPanelView().getCurrentPageView().currentTab.navigate( up );
		}
	}
}
