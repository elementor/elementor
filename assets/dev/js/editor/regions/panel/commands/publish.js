import CommandHookable from 'elementor-api/modules/command-hookable';

export class Publish extends CommandHookable {
	apply() {
		$e.run( 'document/save/publish' );
	}
}

export default Publish;

