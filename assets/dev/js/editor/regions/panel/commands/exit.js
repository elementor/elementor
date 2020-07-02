import CommandBase from 'elementor-api/modules/command-base';

export class Exit extends CommandBase {
	apply() {
		$e.route( 'panel/menu' );
	}
}

export default Exit;
