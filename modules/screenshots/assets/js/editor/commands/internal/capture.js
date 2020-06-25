import CommandInternalBase from "elementor-api/modules/command-internal-base";

export class Capture extends CommandInternalBase {
	apply(args) {
		jQuery( 'body' ).append(
			this.createIframe()
		);
	}

	createIframe() {
		const iframe = document.createElement( 'iframe' );

		iframe.src = this.getIframeUrl();
		iframe.width = '1300';
		iframe.style = 'visibable: hidden;';

		return iframe;
	}

	getIframeUrl() {
		return elementor.config.document.urls.preview.replace( 'elementor-preview', 'elementor-screenshot' );
	}
}
