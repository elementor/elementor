import Command from 'elementor-api/modules/command';

export class Open extends Command {
	apply( args ) {
		$e.route( 'app', args );

		return true;
	}
}

export default Open;
