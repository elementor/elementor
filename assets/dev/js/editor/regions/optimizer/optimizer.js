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
