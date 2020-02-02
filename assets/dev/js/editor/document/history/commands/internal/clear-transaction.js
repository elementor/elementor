import Base from '../base/base';

export class ClearTransaction extends Base {
	apply( args ) {
		this.component.transactions = [];
	}
}

export default ClearTransaction;
