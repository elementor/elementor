import After from 'elementor-api/modules/hooks/ui/after';

export class OpenLibraryAfterDelete extends After {
	getCommand() {
		return 'document/elements/delete';
	}

	getId() {
		return 'open-library-after-delete';
	}

	getConditions( args ) {
		let type = args?.container?.document?.config?.type;
		if ( ! type ) {
			type = args?.containers[ 0 ]?.document?.config?.type;
		}

		return 'floating-buttons' === type;
	}

	apply() {
		$e.run( 'library/open' );
	}
}

export default OpenLibraryAfterDelete;
