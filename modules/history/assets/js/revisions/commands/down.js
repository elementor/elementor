import CommandBase from 'elementor-api/modules/command-base';

export class Down extends CommandBase {
	apply() {
		this.component.navigate();
	}
}

export default Down;
