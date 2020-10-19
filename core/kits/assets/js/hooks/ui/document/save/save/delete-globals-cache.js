import After from 'elementor-api/modules/hooks/data/after';

export class KitDeleteGlobalsCache extends After {
	getCommand() {
		return 'document/save/save';
	}

	getConditions( args ) {
		const { status, document = elementor.documents.getCurrent() } = args;
		return 'publish' === status && 'kit' === document.config.type;
	}

	getId() {
		return 'document/save/save::update-globals-cache';
	}

	apply() {
		// After kit updates - remove globals from cache and force re-request from server.
		$e.components.get( 'globals' ).refreshGlobalData();
	}
}

export default KitDeleteGlobalsCache;
