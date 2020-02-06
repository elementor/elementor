import Base from '../base/base';

export class EndLog extends Base {
	apply( args ) {
		if ( args.id ) {
			this.history.endItem( args.id );
		}
	}
}

export default EndLog;
