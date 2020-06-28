import Command from 'elementor-api/modules/command';

export class Publish extends Command {
	apply() {
		$e.run( 'document/save/publish' );
	}
}

export default Publish;

