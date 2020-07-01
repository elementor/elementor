import CommandInternalBase from 'elementor-api/modules/command-internal-base';

export class Capture extends CommandInternalBase {
	apply() {
		this.component.isCapturingScreenshot = true;

		const iframe = this.createIframe();

		jQuery( 'body' ).append( iframe );

		// The iframe send an event when the screenshot process complete
		// then the command send a notice to the component about it.
		window.onmessage = ( message ) => {
			if ( ! message.data.name || message.data.name !== 'capture-screenshot-done' ) {
				return;
			}

			this.component.isCapturingScreenshot = false;

			if ( ! elementorCommonConfig.isDebug ) {
				iframe.remove();
			}
		};
	}

	createIframe() {
		const iframe = document.createElement( 'iframe' );

		iframe.src = this.getIframeUrl();
		iframe.width = '1200';
		iframe.style = 'visibility: hidden;';

		return iframe;
	}

	getIframeUrl() {
		return elementor.config.document.urls.screenshot;
	}
}
