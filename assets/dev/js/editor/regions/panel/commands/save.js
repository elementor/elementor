import CommandHookable from 'elementor-api/modules/command-hookable';

export class Save extends CommandHookable {
	apply() {
		$e.run( 'document/save/draft' );
	}
}

export default Save;

