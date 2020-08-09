import Command from 'elementor-api/modules/command';

export class Close extends Command {
	apply() {
		return this.component.close();
	}
}

export default Close;
