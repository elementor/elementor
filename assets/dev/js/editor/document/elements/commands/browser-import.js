import CommandBase from 'elementor-api/modules/command-base';
import SessionFactory from '../../../utils/iomanager/session-factory';

export class BrowserImport extends CommandBase {
	validateArgs( args ) {
		this.requireContainer( args );
	}

	apply( args ) {
		const { containers = [ args.container ], input, options = {} } = args;

		containers.map( ( container ) => {
			SessionFactory
				.createSession( input, container, options )
				.then( ( session ) => {
					session.apply();
				} );
		} );
	}
}

export default BrowserImport;
