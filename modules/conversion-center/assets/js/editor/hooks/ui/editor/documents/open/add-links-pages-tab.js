export class LinksPageAddLibraryTab extends $e.modules.hookUI.After {
	getCommand() {
		return 'editor/documents/open';
	}

	getId() {
		return 'elementor-links-pages-add-library-tab';
	}

	getConditions( args ) {
		const document = elementor.documents.get( args.id );
		return 'links-page' === document.config.type;
	}

	apply() {
		$e.components.get( 'library' ).addTab( 'templates/links-pages', {
			title: __( 'Links Pages', 'elementor' ),
			filter: {
				source: 'remote',
				type: 'block',
				subtype: 'hero',
			},
		}, 2 );

		$e.components.get( 'library' ).removeTab( 'templates/blocks' );
		$e.components.get( 'library' ).removeTab( 'templates/pages' );
	}
}

export default LinksPageAddLibraryTab;
