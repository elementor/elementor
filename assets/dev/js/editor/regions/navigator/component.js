export default class extends elementorModules.Component {
	getNamespace() {
		return 'navigator';
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

	open() {
		this.context.open();
		return true;
	}

	close() {
		this.context.close();
	}
}
