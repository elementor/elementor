export default class extends Marionette.Region {
	initialize() {
		this.show( new View() );
	}

/*	onPanelResizeStart() {
		this.$el.addClass( 'ui-resizable-resizing' );
	}

	onPanelResizeStop() {
		this.$el.removeClass( 'ui-resizable-resizing' );
	}*/
}

class View extends Marionette.ItemView {
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
			'load @ui.iframe': 'this.onIframeLoad',
		};
	}

	initialize() {
		const previewUrl = elementor.config.initial_document.urls.permalink + '?analyzer=1';

		setTimeout( () => {
			this.ui.iframe.attr( 'src', previewUrl )
				.css( {
					position: 'absolute',
					top: '-50px',
					left: '-50px',
					width: '1400px',
					height: '1200px',
					transform: 'scale(0.25)',
					'transform-origin': 'top left',
					'z-index': -1,
				} );
			this.ui.iframe.trigger( 'load' );

			window.addEventListener( 'message', ( e ) => {
				const key = e.message ? 'message' : 'data';
				const data = e[ key ];

				console.log( data );
			}, false );
		}, 1000 );
	}

	onIframeLoad() {
		console.log( 'iframeloaded', this.ui.iframe );
	}
}

/*
export default class extends elementorModules.ViewModule {
	getDefaultSettings() {
		return {
			selectors: {
				iframe: '#elementor-optimizer',
			},
		};
	}

	getDefaultElements() {
		const settings = this.getSettings();

		return {
			$iframe: jQuery( settings.selectors.iframe ),
		};
	}

	bindEvents() {
		this.elements.$iframe.on( 'load', this.onOptimizerLoaded.bind( this ) );
	}

	onOptimizerLoaded() {
		console.log( 'Optimizer loaded' );

		// elementorCommon.ajax.addRequest( 'notice_bar_dismiss' );
	}
}
*/
