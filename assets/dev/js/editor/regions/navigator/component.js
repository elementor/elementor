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
					this.close();
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
		if ( ! super.close() ) {
			return false;
		}

		this.context.close();

		return true;
	}
}
