export class ClearTransaction extends $e.modules.CommandInternalBase {
	apply() {
		this.component.transactions = [];
	}
}

export default ClearTransaction;
