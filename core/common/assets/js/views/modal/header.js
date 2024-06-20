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

		if ( this.isFloatingButtonLibraryClose() ) {
			// Had to use jQuery as it is the only thing that worked.
			jQuery( window ).off( 'beforeunload' );
			window.location.href = elementor.config.admin_floating_button_admin_url;
		}
	}

	isFloatingButtonLibraryClose() {
		return window.elementor && elementor.config?.admin_floating_button_admin_url &&
			'floating-buttons' === elementor.config?.document?.type &&
			this.$el.find( '#elementor-template-library-header-menu' ).length;
	}
}
