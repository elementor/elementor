import Command from 'elementor-api/modules/command';

export class Save extends Command {
	apply() {
		$e.run( 'document/save/draft' );
	}
}

export default Save;

