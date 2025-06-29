import { regenerateLocalStyleIds } from '../../../utils/regenerate-local-style-ids';

export class DuplicateElement extends $e.modules.hookData.After {
	getCommand() {
		return 'document/elements/duplicate';
	}

	getId() {
		return 'regenerate-local-style-ids--document/elements/duplicate';
	}

	apply( args, result ) {
		const containers = Array.isArray( result ) ? result : [ result ];

		containers.forEach( regenerateLocalStyleIds );
	}
}
