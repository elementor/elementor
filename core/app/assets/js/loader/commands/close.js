import Command from 'elementor-api/modules/command';

export class Close extends Command {
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
