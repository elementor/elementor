export default class extends Marionette.ItemView {
	getTemplate() {
		return '#tmpl-elementor-templates-modal__header__logo';
	}

	className() {
		return 'elementor-templates-modal__header__logo';
	}

	events() {
		return {
			click: 'onClick',
		};
	}

	templateHelpers() {
		return {
			title: this.getOption( 'title' ),
		};
	}

	onClick() {
		const clickCallback = this.getOption( 'click' );

		if ( clickCallback ) {
			clickCallback();
		}
	}
}
