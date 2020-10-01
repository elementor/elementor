import CommandBase from 'elementor-api/modules/command-base';

export class Close extends CommandBase {
	apply() {
		if ( ! this.component.close() ) {
			return false;
		}

		this.component.iframe.remove();
		this.component.iframe = null;

		return true;
	}
}

export default Close;
