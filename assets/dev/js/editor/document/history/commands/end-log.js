import CommandBase from 'elementor-api/modules/command-base';

export class EndLog extends CommandBase {
	apply( args ) {
		if ( args.id ) {
			elementor.history.history.endItem( args.id );
		}
	}
}

export default EndLog;
