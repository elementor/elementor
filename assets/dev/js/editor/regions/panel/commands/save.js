import CommandBase from 'elementor-api/modules/command-base';

export class Save extends CommandBase {
	apply() {
		$e.run( 'document/save/draft' );
	}
}

export default Save;

