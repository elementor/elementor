import CommandBase from 'elementor-api/modules/command-base';

export class Close extends CommandBase {
	apply( args ) {
		if ( ! this.component.close() ) {
			return false;
		}

		if ( args.redirect ) {
			// Directly.
			window.top.location = elementorAppConfig.return_url;
		} else {
			// Iframe.
			this.component.iframe.style.display = 'none';
			document.body.style.overflow = '';
		}

		return true;
	}
}

export default Close;
