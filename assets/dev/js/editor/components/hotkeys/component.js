export default class extends elementorModules.Component {
	constructor( ...args ) {
		super( ...args );

		this.title = 'Shortcuts';
		this.namespace = 'shortcuts';
	}

	init( args ) {
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

	getShortcuts() {
		return {
			'': {
				keys: 'ctrl+?',
			},
		};
	}
}
