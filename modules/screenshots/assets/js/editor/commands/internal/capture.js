import CommandInternalBase from 'elementor-api/modules/command-internal-base';

export class Capture extends CommandInternalBase {
	apply() {
		this.component.capturingScreenshot = true;

		const iframe = this.createIframe();

		jQuery( 'body' ).append( iframe );

		// The iframe send an event when the screenshot process complete
		// then the command send a notice to the component about it.
		window.onmessage = ( message ) => {
			if ( ! message.data.name || message.data.name !== 'capture-screenshot-done' ) {
				return;
			}

			this.component.capturingScreenshot = false;
		};
	}

	createIframe() {
		const iframe = document.createElement( 'iframe' );

		iframe.src = this.getIframeUrl();
		iframe.width = '1300';
		iframe.style = 'visibility: hidden;';

		return iframe;
	}

	getIframeUrl() {
		return elementor.config.document.urls.screenshot;
	}
}
