import Command from 'elementor-api/modules/command';

export class Up extends Command {
	apply() {
		this.component.navigate( true );
	}
}

export default Up;
