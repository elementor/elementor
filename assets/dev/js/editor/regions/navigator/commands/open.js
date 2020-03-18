import Command from 'elementor-api/modules/command';

export class Open extends Command {
	apply() {
		$e.route( this.component.getNamespace() );
	}
}

export default Open;
