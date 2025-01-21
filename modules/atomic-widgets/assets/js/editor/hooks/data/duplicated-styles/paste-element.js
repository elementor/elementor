import { handleDuplicatedStyles } from '../../../utils/handle-duplicated-styles';

export class PasteElementHook extends $e.modules.hookData.After {
	getCommand() {
		return 'document/elements/paste';
	}

	getId() {
		return 'duplicate-element--document/elements/paste';
	}

	apply( args, result ) {
		const containers = Array.isArray( result ) ? result : [ result ];

		containers.forEach( handleDuplicatedStyles );
	}
}
export default PasteElementHook;
