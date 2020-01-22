import Base from './base/base';

export class DeleteTransaction extends Base {
	apply( args ) {
		this.component.transactions = [];
	}
}

export default DeleteTransaction;
