import Base from '../../commands/base/base';

export class StartTransaction extends Base {
	validateArgs( args ) {
		this.requireArgumentType( 'type', 'string', args );
	}

	apply( args ) {
		$e.run( 'document/history/add-transaction', args );
	}
}

export default StartTransaction;
