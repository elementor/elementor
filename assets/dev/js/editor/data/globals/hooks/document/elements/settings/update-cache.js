import After from 'elementor-api/modules/hooks/data/after';
import DocumentCache from 'elementor-editor/data/globals/helpers/document-cache';

export class ElementsSettingsUpdateCache extends After {
	getCommand() {
		return 'document/elements/settings';
	}

	getConditions( args, result ) {
		const { containers = [ args.container ] } = args;

		// TODO: Remove - Create testing compatibility.
		return ! elementorCommonConfig.isTesting && 'repeater' !== containers[ 0 ].type;
	}

	getId() {
		return 'document/elements/settings::update-cache';
	}

	apply( args ) {
		const { containers = [ args.container ] } = args;

		DocumentCache.updateByContainers( containers, args.settings );
	}
}

export default ElementsSettingsUpdateCache;
