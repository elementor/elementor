import CommandInternalBase from 'elementor-api/modules/command-internal-base';

export class Capture extends CommandInternalBase {
	constructor() {
		super();

		this.iframe = null;
	}

	apply() {
		this.component.isCapturingScreenshot = true;

		this.iframe = this.createIframe();

		document.body.append( this.iframe );

		// The iframe send an event when the screenshot process complete
		// then the command send a notice to the component about it.
		return new Promise( ( resolve ) => {
			const listener = ( message ) => {
				this.listenIframeMessage( message );

				window.removeEventListener( 'message', listener );

				resolve( this.iframe );
			};

			window.addEventListener( 'message', listener );
		} );
	}

	createIframe() {
		const iframe = document.createElement( 'iframe' );

		iframe.src = this.getIframeUrl();
		iframe.width = '1200';
		iframe.style = 'visibility: hidden;';

		return iframe;
	}

	listenIframeMessage( message ) {
		if ( ! message.data.name || message.data.name !== 'capture-screenshot-done' ) {
			return;
		}

		this.component.isCapturingScreenshot = false;

		if ( ! elementorCommonConfig.isDebug ) {
			this.iframe.remove();
		}
	}

	getIframeUrl() {
		return elementor.config.document.urls.screenshot;
	}
}
