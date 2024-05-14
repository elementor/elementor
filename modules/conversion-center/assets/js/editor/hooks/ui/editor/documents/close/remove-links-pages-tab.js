export class LinksPageRemoveLibraryTab extends $e.modules.hookUI.After {
	getCommand() {
		return 'editor/documents/unload';
	}

	getId() {
		return 'elementor-links-pages-remove-library-tab';
	}

	getConditions( args ) {
		const { document } = args;
		return 'links-page' === document.config.type;
	}

	apply() {
		$e.components.get( 'library' ).removeTab( 'templates/links-pages' );

		$e.components.get( 'library' ).addTab( 'templates/pages' );
		$e.components.get( 'library' ).addTab( 'templates/blocks' );

		console.log(elementor.config?.admin_conversion_center_url, 'elementor.config?.admin_conversion_center_url');
		if ( elementor.config?.admin_conversion_center_url ) {
			window.location.href = elementor.config.admin_conversion_center_url;
		}
	}
}

export default LinksPageRemoveLibraryTab;
