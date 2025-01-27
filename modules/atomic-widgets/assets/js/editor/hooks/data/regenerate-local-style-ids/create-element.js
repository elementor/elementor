import { regenerateLocalStyleIds } from '../../../utils/regenerate-local-style-ids';

export class CreateElementHook extends $e.modules.hookData.After {
	getCommand() {
		return 'document/elements/create';
	}

	getId() {
		return 'regenerate-local-style-ids--document/elements/duplicate';
	}

	apply( args, result ) {
		const containers = Array.isArray( result ) ? result : [ result ];

		containers.forEach( regenerateLocalStyleIds );
	}
}
export default CreateElementHook;
