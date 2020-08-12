import CommandBase from 'elementor-api/modules/command-base';

export class Close extends CommandBase {
	apply() {
		if ( ! this.component.close() && ! elementor.navigator.isOpen() ) {
			return false;
		}

		this.component.manager.close();

		return true;
	}
}

export default Close;
