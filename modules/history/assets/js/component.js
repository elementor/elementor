export default class extends elementorModules.Component {
	init( args ) {
		this.title = 'History';
		this.namespace = 'panel/history';

		super.init( args );
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
				scope: [ 'global' ],
			},
			revisions: {
				keys: 'ctrl+shift+r',
				scope: [ 'global' ],
			},
		};
	}
}
