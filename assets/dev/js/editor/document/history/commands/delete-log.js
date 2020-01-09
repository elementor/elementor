import CommandBase from 'elementor-api/modules/command-base';

export class DeleteLog extends CommandBase {
	apply( args ) {
		if ( args.id ) {
			this.history.deleteItem( args.id );
		}
	}
}

export default DeleteLog;
