export class ContactPageRemoveLibraryTab extends $e.modules.hookUI.After {
	getCommand() {
		return 'editor/documents/unload';
	}

	getId() {
		return 'elementor-contact-buttons-remove-library-tab';
	}

	getConditions( args ) {
		const { document } = args;
		return 'contact-buttons' === document.config.type;
	}

	apply() {
		$e.components.get( 'library' ).removeTab( 'templates/contact-buttons' );

		$e.components.get( 'library' ).addTab( 'templates/pages' );
		$e.components.get( 'library' ).addTab( 'templates/blocks' );
	}
}

export default ContactPageRemoveLibraryTab;
