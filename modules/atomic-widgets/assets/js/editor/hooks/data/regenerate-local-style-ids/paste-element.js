import { regenerateLocalStyleIds } from '../../../utils/regenerate-local-style-ids';

export class PasteElementHook extends $e.modules.hookData.After {
	getCommand() {
		return 'document/elements/paste';
	}

	getId() {
		return 'regenerate-local-style-ids--document/elements/paste';
	}

	apply( args, result ) {
		const containers = Array.isArray( result ) ? result : [ result ];

		containers.forEach( regenerateLocalStyleIds );
	}
}
export default PasteElementHook;
