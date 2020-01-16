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
		this.$el.prepend( buttonBack );
		this.$el.append( buttonClose );
	}

	onClickClose() {
		// The kit is opened directly.
		if ( elementor.config.initial_document.id === elementor.config.kit_id ) {
			$e.run( 'panel/global/exit' );
		} else {
			$e.run( 'panel/global/close' );
		}
	}

	onClickBack() {
		$e.routes.back( 'panel/global' );
	}
}
