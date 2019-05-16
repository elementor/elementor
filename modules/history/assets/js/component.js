export default class extends elementorModules.Component {
	constructor( ...args ) {
		super( ...args );

		this.title = 'History';
		this.namespace = 'panel/history';
	}

	getTabsWrapperSelector() {
		return '#elementor-panel-elements-navigation';
	}

	getTabs() {
		return {
			actions: elementor.translate( 'actions' ),
			revisions: elementor.translate( 'revisions' ),
		};
	}

	getShortcuts() {
		return {
			actions: {
				keys: 'ctrl+shift+h',
			},
			revisions: {
				keys: 'ctrl+shift+r',
			},
		};
	}
}
