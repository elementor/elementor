export class ContactPageAddLibraryTab extends $e.modules.hookUI.After {
	getCommand() {
		return 'editor/documents/open';
	}

	getId() {
		return 'elementor-contact-buttons-add-library-tab';
	}

	getConditions( args ) {
		const document = elementor.documents.get( args.id );
		return 'contact-buttons' === document.config.type;
	}

	apply() {
		$e.components.get( 'library' ).addTab( 'templates/contact-buttons', {
			title: __( 'Contact Buttons', 'elementor' ),
			filter: {
				source: 'remote',
				type: 'block',
				subtype: 'Quote',
			},
		}, 2 );

		$e.components.get( 'library' ).removeTab( 'templates/blocks' );
		$e.components.get( 'library' ).removeTab( 'templates/pages' );
	}
}

export default ContactPageAddLibraryTab;
