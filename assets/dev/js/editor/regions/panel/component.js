export default class extends elementorModules.Component {
	init( args ) {
		this.title = 'Panel';
		this.namespace = 'panel';

		super.init( args );
	}

	getRoutes() {
		return {
			menu: () => this.view.setPage( 'menu' ),
		};
	}

	getCommands() {
		return {
			save: () => elementor.saver.saveDraft(),
			exit: () => elementorCommon.route.to( 'panel/menu' ),
		};
	}

	getShortcuts() {
		return {
			save: {
				keys: 'ctrl+s',
				scope: [ 'global' ],
			},
			exit: {
				keys: 'esc',
				// TODO: replace dependency with scope.
				dependency: () => {
					return ! jQuery( '.dialog-widget:visible' ).length;
				},
				scope: [ 'panel', 'preview' ],
			},
		};
	}
}
