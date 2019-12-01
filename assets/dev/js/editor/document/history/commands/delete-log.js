import Base from '../../commands/base/base';

export class DeleteLog extends Base {
	apply( args ) {
		if ( args.id ) {
			elementor.history.history.deleteItem( args.id );
		}
	}
}

export default DeleteLog;
