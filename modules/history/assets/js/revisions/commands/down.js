import Command from 'elementor-api/modules/command';

export class Down extends Command {
	apply() {
		this.component.navigate();
	}
}

export default Down;
