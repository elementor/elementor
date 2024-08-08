export class FloatingButtonsAddLibraryTab extends $e.modules.hookUI.After {
	getCommand() {
		return 'editor/documents/open';
	}

	getId() {
		return 'elementor-floating-buttons-add-library-tab';
	}

	getConditions( args ) {
		const document = elementor.documents.get( args.id );
		return 'floating-buttons' === document.config.type;
	}

	apply() {
		$e.components.get( 'library' ).addTab( 'templates/floating-buttons', {
			title: __( 'Floating Elements', 'elementor' ),
			filter: {
				source: 'remote',
				type: 'floating_button',
			},
		}, 2 );

		$e.components.get( 'library' ).removeTab( 'templates/blocks' );
		$e.components.get( 'library' ).removeTab( 'templates/pages' );
	}
}

export default FloatingButtonsAddLibraryTab;
