import CommandBase from 'elementor-api/modules/command-base';

export class Validate extends CommandBase {
	/**
	 * @inheritDoc
	 */
	apply( args ) {
		const { input, options = {} } = args;

		return this.component.manager
			.createSession( input, elementor.getPreviewContainer(), options )
			.then( ( session ) => session.validate() );
	}
}

export default Validate;
