import Base from '../base/base';

export class ClearTransaction extends Base {
	apply() {
		this.component.transactions = [];
	}
}

export default ClearTransaction;
