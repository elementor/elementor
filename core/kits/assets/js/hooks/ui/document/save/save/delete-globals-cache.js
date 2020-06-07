import After from 'elementor-api/modules/hooks/data/after';

export class KitDeleteGlobalsCache extends After {
	getCommand() {
		return 'document/save/save';
	}

	getConditions( args ) {
		const { document = elementor.documents.getCurrent() } = args;
		return 'kit' === document.config.type;
	}

	getId() {
		return 'document/save/save::update-globals-cache';
	}

	apply( args ) {
		// After kit updates - remove globals from cache and force re-request from server.
		$e.data.deleteCache( 'globals/index' );
	}
}

export default KitDeleteGlobalsCache;
