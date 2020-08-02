import CommandInternalBase from 'elementor-api/modules/command-internal-base';

export class Capture extends CommandInternalBase {
	constructor() {
		super();

		this.$iframe = null;
	}

	apply() {
		this.component.isCapturingScreenshot = true;

		this.$iframe = this.createIframe();

		elementorCommon.elements.$body.append( this.$iframe );

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
					this.$iframe.remove();
				}

				window.removeEventListener( 'message', listener );

				return data.success ?
					resolve( this.$iframe ) :
					reject();
			};

			window.addEventListener( 'message', listener );
		} );
	}

	createIframe() {
		return jQuery( '<iframe />', {
			src: this.getIframeUrl(),
			css: {
				width: '1200px',
				visibility: 'hidden',
			},
		} );
	}

	getIframeUrl() {
		return elementor.config.document.urls.screenshot;
	}
}
