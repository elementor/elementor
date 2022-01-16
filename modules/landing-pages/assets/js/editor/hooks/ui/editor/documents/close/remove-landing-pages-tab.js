export class LandingPageRemoveLibraryTab extends $e.modules.hookUI.After {
	getCommand() {
		return 'editor/documents/unload';
	}

	getId() {
		return 'elementor-landing-pages-remove-library-tab';
	}

	getConditions( args ) {
		const { document } = args;
		return 'landing-page' === document.config.type;
	}

	apply() {
		$e.components.get( 'library' ).removeTab( 'templates/landing-pages' );

		// Pages are replaced by landing pages so when Landing Pages are removed, the Pages have to be re-added.
		$e.components.get( 'library' ).addTab( 'templates/pages' );
	}
}

export default LandingPageRemoveLibraryTab;
