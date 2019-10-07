export default class extends Marionette.ItemView {
	id() {
		return 'elementor-kit-panel-header';
	}

	getTemplate() {
		return '#tmpl-elementor-kit-panel-header';
	}

	ui() {
		return {
			title: '#elementor-kit__panel-header__title',
			closeButton: '#elementor-kit__panel-header__close-button',
			backButton: '#elementor-kit__panel-header__back-button',
		};
	}

	events() {
		return {
			'click @ui.closeButton': 'onClickClose',
			'click @ui.backButton': 'onClickBack',
		};
	}

	setTitle( title ) {
		this.ui.title.html( title );
	}

	onClickClose() {
		$e.routes.close( 'menu' );
	}

	onClickBack() {
		$e.routes.back();
	}
}

