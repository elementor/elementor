export class KitAddMenuItems extends $e.modules.hookUI.Before {
	getCommand() {
		return 'editor/documents/attach-preview';
	}

	getId() {
		return 'kit-add-menu-item';
	}

	getConditions() {
		return 'kit' === elementor.documents.getCurrent().config.type && ! Object.keys( $e.components.get( 'panel/global' ).getTabs() ).length;
	}

	apply() {
		const document = elementor.documents.getCurrent();

		Object.entries( document.config.tabs ).forEach( ( [ tabId, tabConfig ] ) => {
			$e.components.get( 'panel/global' ).addTab( tabId, tabConfig );
		} );
	}
}

export default KitAddMenuItems;
