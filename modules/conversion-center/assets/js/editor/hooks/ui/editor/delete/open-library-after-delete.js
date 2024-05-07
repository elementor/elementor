import After from 'elementor-api/modules/hooks/ui/after';

export class OpenLibraryAfterDelete extends After {
	getCommand() {
		return 'document/elements/delete';
	}

	getId() {
		return 'open-library-after-delete';
	}

	getConditions( args ) {
		const { container: { document } } = args;
		return 'links-page' === document.config.type;
	}

	apply() {
		$e.run( 'library/open' );
	}
}

export default OpenLibraryAfterDelete;
