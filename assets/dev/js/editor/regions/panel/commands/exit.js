import CommandHookable from 'elementor-api/modules/command-hookable';

export class Exit extends CommandHookable {
	apply() {
		$e.route( 'panel/menu' );
	}
}

export default Exit;
