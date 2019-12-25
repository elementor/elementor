import CommandBase from 'elementor-api/modules/command-base';

export class StartTransaction extends CommandBase {
	validateArgs( args ) {
		this.requireArgumentType( 'type', 'string', args );
	}

	apply( args ) {
		$e.run( 'document/history/add-transaction', args );
	}
}

export default StartTransaction;
