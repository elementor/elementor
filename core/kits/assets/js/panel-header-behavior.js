import {
	buttonBack,
	buttonClose,
} from './panel-header-buttons';

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
		this.$el.prepend( elementor.compileTemplate( buttonBack, { Back: elementor.translate( 'back' ) } ) );
		this.$el.append( elementor.compileTemplate( buttonClose, { Close: elementor.translate( 'close' ) } ) );
	}

	onClickClose() {
		$e.run( 'panel/global/close' );
	}

	onClickBack() {
		$e.run( 'panel/global/back' );
	}
}
