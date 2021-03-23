import Command from 'elementor-api/modules/command';

export class Exit extends Command {
	apply() {
		$e.route( 'panel/menu' );
	}
}

export default Exit;
