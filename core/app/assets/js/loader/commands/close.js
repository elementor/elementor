import Command from 'elementor-api/modules/command';

export class Close extends Command {
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
