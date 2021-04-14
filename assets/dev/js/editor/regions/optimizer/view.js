export default class View extends Marionette.ItemView {
	getTemplate() {
		return '#tmpl-elementor-templates-optimizer';
	}

	className() {
		return 'elementor-optimizer';
	}

	ui() {
		return {
			iframe: '#optimizer-iframe',
		};
	}

	events() {
		return {
			'load @ui.iframe': 'onIframeLoad',
		};
	}

	initialize() {
		const previewUrl = elementor.config.initial_document.urls.wp_preview;

		setTimeout( () => {
			this.ui.iframe.attr( 'src', previewUrl )
				.css( {
					position: 'absolute',
					top: '50px',
					right: '50px',
					width: '1200px',
					height: '1000px',
					transform: 'scale(0.25)',
				} );
			this.ui.iframe.trigger( 'load' );

			console.error( this.ui.iframe );
		}, 500 );
	}

	onIframeLoad() {
		console.error( 'iframeloaded', this.ui.iframe );
	}
}
