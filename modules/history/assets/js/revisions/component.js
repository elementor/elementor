export default class extends elementorModules.Component {
	init( args ) {
		this.title = 'Revisions';
		this.namespace = 'panel/history/revisions';

		super.init( args );
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
