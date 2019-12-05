import Base from '../../commands/base/base';

export class EndLog extends Base {
	apply( args ) {
		if ( args.id ) {
			elementor.documents.getCurrent().history.endItem( args.id );
		}
	}
}

export default EndLog;
