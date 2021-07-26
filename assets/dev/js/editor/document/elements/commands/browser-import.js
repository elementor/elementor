import CommandBase from 'elementor-api/modules/command-base';
import SessionBuilder from '../../../utils/iomanager/session-builder';

export class BrowserImport extends CommandBase {
	/**
	 * @inheritDoc
	 */
	validateArgs( args ) {
		this.requireContainer( args );
	}

	/**
	 * @inheritDoc
	 */
	apply( args ) {
		const { containers = [ args.container ], input, options = {
			sessionHandler: undefined,
		} } = args;
		let sessionHandler = options.sessionHandler;

		containers.map( ( container ) => {
			if ( ! sessionHandler ) {
				sessionHandler = SessionBuilder
					.createSession()
					.normalizeInput( input )
					.setContainer( container )
					.getSessionHandler();
			}

			return sessionHandler.then( ( session ) => {
				session.apply();
			} );
		} );
	}
}

export default BrowserImport;
