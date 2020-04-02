import After from 'elementor-api/modules/hooks/data/after';
import DocumentCache from 'elementor-editor/data/globals/helpers/document-cache';

export class GlobalsSettingsUpdateCache extends After {
	getCommand() {
		return 'document/globals/settings';
	}

	getConditions( args, result ) {
		// TODO: Remove - Create testing compatibility.
		return ! elementorCommonConfig.isTesting;
	}

	getId() {
		return 'document/globals/settings::update-cache'; // TODO: I think better to use this format.
	}

	apply( args ) {
		const { containers = [ args.container ] } = args;

		DocumentCache.updateFromContainers( containers );
	}
}

export default GlobalsSettingsUpdateCache;
