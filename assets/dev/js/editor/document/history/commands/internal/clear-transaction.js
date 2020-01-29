import Base from '../base/base';

export class ClearTransaction extends Base {
	initialize() {
		if ( $e.devTools && ! this.component.isTransactionStarted() ) {
			$e.devTools.log.warn( 'Transaction is already started' );
		}
	}

	apply( args ) {
		this.component.transactions = [];
	}
}

export default ClearTransaction;
