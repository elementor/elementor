import Base from '../../commands/base/base';

export class EndLog extends Base {
	apply( args ) {
		if ( args.id ) {
			elementor.history.history.endItem( args.id );
		}
	}
}

export default EndLog;
