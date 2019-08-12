export default class extends elementorModules.common.Component {
	getNamespace() {
		return 'navigator';
	}

	defaultRoutes() {
		return {
			'': () => {},
		};
	}

	defaultCommands() {
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

	defaultShortcuts() {
		return {
			toggle: {
				keys: 'ctrl+i',
				dependency: () => 'edit' === elementor.channels.dataEditMode.request( 'activeMode' ),
			},
		};
	}

	open() {
		this.manager.open();
		return true;
	}

	close() {
		if ( ! super.close() ) {
			return false;
		}

		this.manager.close();

		return true;
	}
}
