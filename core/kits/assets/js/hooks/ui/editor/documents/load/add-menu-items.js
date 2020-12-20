export class KitAddMenuItems extends $e.modules.hookUI.After {
	getCommand() {
		return 'editor/documents/load';
	}

	getId() {
		return 'kit-add-menu-item';
	}

	getConditions() {
		return 'kit' === elementor.documents.getCurrent().config.type && ! Object.keys( $e.components.get( 'panel/global' ).getTabs() ).length;
	}

	apply( { config } ) {
		Object.entries( config.tabs ).forEach( ( [ tabId, tabConfig ] ) => {
			$e.components.get( 'panel/global' ).addTab( tabId, tabConfig );
		} );
	}
}

export default KitAddMenuItems;
