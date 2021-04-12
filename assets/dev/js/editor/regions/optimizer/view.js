export default class View extends Marionette.ItemView {
	getTemplate() {
		return '#elementor-optimizer';
	}

	className() {
		return 'elementor-optimizer';
	}

	ui() {
		return {
			iframe: 'iframe',
			wrapper: '.elementor-optimizer',
		};
	}

	events() {
		return {
			'load @ui.iframe': 'onIframeLoad',
		};
	}

	initialize() {
		const $iframe = jQuery( document.createElement( 'iframe' ) );

		$iframe.attr( 'src', 'https://google.com/' );

		elementorCommon.elements.$body.append( $iframe );
	}

	onIframeLoad() {
		console.log('iframe loaded');
	}
}
