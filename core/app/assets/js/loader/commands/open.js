import CommandBase from 'elementor-api/modules/command-base';

export class Open extends CommandBase {
	apply( args ) {
		$e.route( 'app', args );

		return true;
	}
}

export default Open;
