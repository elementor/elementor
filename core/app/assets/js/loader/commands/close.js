import CommandBase from 'elementor-api/modules/command-base';

export class Close extends CommandBase {
	apply() {
		if ( ! this.component.close() ) {
			return false;
		}

		this.component.iframe.style.display = 'none';
		document.body.style.overflow = '';

		return true;
	}
}

export default Close;
