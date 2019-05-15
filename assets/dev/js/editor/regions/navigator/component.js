export default class extends elementorModules.Component {
	constructor( ...args ) {
		super( ...args );

		this.title = 'Navigator';
		this.namespace = 'navigator';
	}

	open() {
		this.parent.open();
		return true;
	}

	close() {
		this.parent.close();
	}

	getRoutes() {
		return {
			'': () => {},
		};
	}

	getCommands() {
		return {
			toggle: () => {
				if ( elementorCommon.route.isPartOf( 'navigator' ) ) {
					elementorCommon.route.close( 'navigator' );
				} else {
					elementorCommon.route.to( 'navigator' );
				}
			},
		};
	}

	getShortcuts() {
		return {
			toggle: {
				keys: 'ctrl+i',
				dependency: () => 'edit' === elementor.channels.dataEditMode.request( 'activeMode' ),
			},
		};
	}
}
