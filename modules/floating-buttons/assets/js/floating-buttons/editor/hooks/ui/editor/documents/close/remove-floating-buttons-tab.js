export class FloatingButtonsRemoveLibraryTab extends $e.modules.hookUI.After {
	getCommand() {
		return 'editor/documents/unload';
	}

	getId() {
		return 'elementor-floating-buttons-remove-library-tab';
	}

	getConditions( args ) {
		const { document } = args;
		return 'floating-buttons' === document.config.type;
	}

	apply() {
		$e.components.get( 'library' ).removeTab( 'templates/floating-buttons' );

		$e.components.get( 'library' ).addTab( 'templates/pages' );
		$e.components.get( 'library' ).addTab( 'templates/blocks' );
	}
}

export default FloatingButtonsRemoveLibraryTab;
