import Component from './component';

( () => {
	function loadDefaultValues() {
		// Load default values on init.
		// Refresh Cache.
		// Cannot use {refresh: true} in `get()` because in the hooks there must be a way to get the data
		// in sychronous way, and when using `refresh: true`, the data will not be available in syncronous way.
		$e.data.cache.storage.removeItem( 'kits-elements-defaults' );
		$e.data.get( 'kits-elements-defaults/index' );
	}

	function addContextMenuItem() {
		elementor.hooks.addFilter( 'elements/widget/contextMenuGroups', ( groups, view ) => {
			if ( ! elementor.config?.user?.is_administrator ) {
				return groups;
			}

			return groups.map( ( group ) => {
				if ( group.name !== 'save' ) {
					return group;
				}

				group.actions = [
					...group.actions,
					{
						name: 'save-as-default',
						title: __( 'Save as Default', 'elementor' ),
						callback: () => $e.run( 'kits-elements-defaults/create', { container: view.getContainer() } ),
					},
				];

				return group;
			} );
		} );
	}

	window.addEventListener( 'elementor/init-components', () => {
		window.$e.components.register( new Component() );
	} );

	window.addEventListener( 'elementor/init', () => {
		loadDefaultValues();
		addContextMenuItem();
	} );
} )();
