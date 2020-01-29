import Base from '../base/base';

export class AddTransaction extends Base {
	validateArgs( args ) {
		this.requireContainer();
		this.requireArgumentType( 'type', 'string', args );
	}

	apply( args ) {
		const currentId = this.history.getCurrentId();

		if ( currentId ) {
			// If log already started chain his historyId.
			args.id = currentId;
		}

		args = this.component.normalizeLogTitle( args );

		this.component.transactions.push( args );
	}
}

export default AddTransaction;
