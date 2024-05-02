export class LinksPageRemoveLibraryTab extends $e.modules.hookUI.After {
	getCommand() {
		return 'editor/documents/unload';
	}

	getId() {
		return 'elementor-landing-pages-remove-library-tab';
	}

	getConditions( args ) {
		const { document } = args;
		return 'links-page' === document.config.type;
	}

	apply() {
		$e.components.get( 'library' ).removeTab( 'templates/links-pages' );

		$e.components.get( 'library' ).addTab( 'templates/pages' );
		$e.components.get( 'library' ).addTab( 'templates/blocks' );
	}
}

export default LinksPageRemoveLibraryTab;
