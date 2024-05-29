export default class extends Marionette.LayoutView {
	className() {
		return 'elementor-templates-modal__header';
	}

	getTemplate() {
		return '#tmpl-elementor-templates-modal__header';
	}

	regions() {
		return {
			logoArea: '.elementor-templates-modal__header__logo-area',
			tools: '#elementor-template-library-header-tools',
			menuArea: '.elementor-templates-modal__header__menu-area',
		};
	}

	ui() {
		return {
			closeModal: '.elementor-templates-modal__header__close',
		};
	}

	events() {
		return {
			'click @ui.closeModal': 'onCloseModalClick',
		};
	}

	templateHelpers() {
		return {
			closeType: this.getOption( 'closeType' ),
		};
	}

	onCloseModalClick() {
		this._parent._parent._parent.hideModal();

		if (
			window.elementor && elementor.config?.admin_conversion_center_contact_url &&
			'contact-buttons' === elementor.config?.document?.type
		) {
			window.location.href = elementor.config.admin_conversion_center_contact_url;
		}
	}
}
