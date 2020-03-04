import CommandBase from 'elementor-api/modules/command-base';

export class Publish extends CommandBase {
	apply() {
		$e.run( 'document/save/publish' );
	}
}

export default Publish;

