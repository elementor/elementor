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
				if ( $e.routes.isPartOf( 'navigator' ) ) {
					this.close();
				} else {
					$e.route( 'navigator' );
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

	open( args ) {
		const { model = false } = args;

		this.manager.open( model );
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
