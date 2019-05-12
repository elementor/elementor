export default class extends elementorModules.Component {
	init( args ) {
		this.title = 'Shortcuts';
		this.namespace = 'shortcuts';

		super.init( args );

		this.parent.layout.getModal().on( 'hide', () => elementorCommon.route.close( 'shortcuts' ) );
	}

	getRoutes() {
		return {
			'': () => {},
		};
	}

	open() {
		this.parent.layout.showModal();
		return true;
	}

	close() {
		this.parent.layout.getModal().hide();
	}

	getShortcuts() {
		return {
			'': {
				keys: 'ctrl+?',
			},
		};
	}
}
