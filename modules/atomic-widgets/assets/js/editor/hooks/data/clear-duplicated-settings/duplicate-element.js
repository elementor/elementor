import { clearDuplicatedSettings } from '../../../utils/clear-duplicated-settings';

export class DuplicateElement extends $e.modules.hookData.After {
	getCommand() {
		return 'document/elements/duplicate';
	}

	getId() {
		return 'clear-duplicated-settings--document/elements/duplicate';
	}

	apply( args, result ) {
		const containers = Array.isArray( result ) ? result : [ result ];

		containers.filter( Boolean ).forEach( clearDuplicatedSettings );
	}
}
