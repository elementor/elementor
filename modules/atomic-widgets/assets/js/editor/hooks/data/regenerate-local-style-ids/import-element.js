import { regenerateLocalStyleIds } from '../../../utils/regenerate-local-style-ids';

export class ImportElementHook extends $e.modules.hookData.After {
	getCommand() {
		return 'document/elements/import';
	}

	getId() {
		return 'regenerate-local-style-ids--document/elements/import';
	}

	apply( args, result ) {
		const containers = Array.isArray( result ) ? result : [ result ];

		containers.forEach( regenerateLocalStyleIds );
	}
}
