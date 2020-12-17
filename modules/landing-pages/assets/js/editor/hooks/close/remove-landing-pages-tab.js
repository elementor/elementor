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
	}
}

export default LandingPageRemoveLibraryTab;
