export default class extends elementorModules.Component {
	constructor( ...args ) {
		super( ...args );

		this.title = 'Revisions';
		this.namespace = 'panel/history/revisions';
	}

	getCommands() {
		return {
			up: () => elementor.getPanelView().getCurrentPageView().currentTab.navigate( true ),
			down: () => elementor.getPanelView().getCurrentPageView().currentTab.navigate(),
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
}
