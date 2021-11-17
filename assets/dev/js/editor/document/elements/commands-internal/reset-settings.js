import CommandBase from 'elementor-api/modules/command-base';

export class ResetSettings extends CommandBase {
	validateArgs( args ) {
		this.requireContainer( args );
	}

	apply( args ) {
		$e.run( 'document/elements/reset-settings', { ...args, silent: true } );
	}
}

export default ResetSettings;
