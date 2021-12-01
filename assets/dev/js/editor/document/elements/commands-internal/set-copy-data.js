import CommandInternalBase from 'elementor-api/modules/command-internal-base';

export class SetCopyData extends CommandInternalBase {
	validateArgs() {
		this.requireArgumentType( 'storageKey', 'string' );
		this.requireContainer();
	}

	apply( args ) {
		const { containers = [ args.container ], storageKey } = args;

		return elementorCommon.storage.set(
			storageKey,
			containers.map( ( container ) => container.model.toJSON( { copyHtmlCache: true } ) )
		);
	}
}
