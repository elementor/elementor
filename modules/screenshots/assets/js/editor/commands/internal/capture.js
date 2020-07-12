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
		return new Promise( ( resolve, reject ) => {
			const listener = ( message ) => {
				const { data } = message;

				if ( ! data.name || data.name !== 'capture-screenshot-done' ) {
					return;
				}

				this.component.isCapturingScreenshot = false;

				if ( ! elementorCommonConfig.isDebug ) {
					this.iframe.remove();
				}

				window.removeEventListener( 'message', listener );

				return data.success ?
					resolve( this.iframe ) :
					reject();
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

	getIframeUrl() {
		return elementor.config.document.urls.screenshot;
	}
}
