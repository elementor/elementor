import {
	buttonBack,
	buttonClose,
} from 'elementor/core/kits/assets/js/panel-header-buttons';

export default class extends Marionette.Behavior {
	ui() {
		return {
			buttonClose: '#elementor-panel-header-kit-close',
			buttonBack: '#elementor-panel-header-kit-back',
		};
	}

	events() {
		return {
			'click @ui.buttonClose': 'onClickClose',
			'click @ui.buttonBack': 'onClickBack',
		};
	}

	onBeforeShow() {
		this.$el.prepend( elementor.compileTemplate( buttonBack, { Back: elementor.translate( 'Back' ) } ) );
		this.$el.append( elementor.compileTemplate( buttonClose, { Close: elementor.translate( 'Close' ) } ) );
	}

	onClickClose() {
		// The kit is opened directly.
		if ( elementor.config.initial_document.id === parseInt( elementor.config.kit_id ) ) {
			$e.run( 'panel/global/exit' );
		} else {
			$e.run( 'panel/global/close' );
		}
	}

	onClickBack() {
		$e.run( 'panel/global/back' );
	}
}
