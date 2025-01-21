import { handleDuplicatedStyles } from '../../../utils/handle-duplicated-styles';

export class ImportElementHook extends $e.modules.hookData.After {
	getCommand() {
		return 'document/elements/import';
	}

	getId() {
		return 'duplicate-element--document/elements/import';
	}

	apply( args, result ) {
		const containers = Array.isArray( result ) ? result : [ result ];

		containers.forEach( handleDuplicatedStyles );
	}
}
export default ImportElementHook;
