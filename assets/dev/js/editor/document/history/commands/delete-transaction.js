import CommandBase from 'elementor-api/modules/command-base';

export class DeleteTransaction extends CommandBase {
	apply( args ) {
		this.component.transactions = [];
	}
}

export default DeleteTransaction;
