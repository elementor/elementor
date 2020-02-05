import Base from '../base/base';

export class DeleteLog extends Base {
	apply( args ) {
		if ( args.id ) {
			this.history.deleteItem( args.id );
		}
	}
}

export default DeleteLog;
