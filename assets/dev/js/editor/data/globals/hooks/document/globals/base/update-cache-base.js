import After from 'elementor-api/modules/hooks/data/after';
import DocumentCache from 'elementor-editor/data/globals/helpers/document-cache';

export class UpdateCacheBase extends After {
	getConditions( args, result ) {
		// TODO: Remove - Create testing compatibility.
		return ! elementorCommonConfig.isTesting;
	}

	apply( args ) {
		const { containers = [ args.container ] } = args;

		DocumentCache.updateFromContainers( containers );
	}
}

export default UpdateCacheBase;
