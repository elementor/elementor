import CommandInternalBase from 'elementor-api/modules/command-internal-base';

export class GetPasteData extends CommandInternalBase {
	validateArgs() {
		this.requireArgumentType( 'storageKey', 'string' );
	}

	apply( args ) {
		const { storageKey } = args;

		return elementorCommon.storage.get( storageKey );
	}
}
