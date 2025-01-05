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

		const type = elementor.config?.document?.type ?? 'default';

		const customEvent = new CustomEvent( `core/modal/close/${ type }` );

		window.dispatchEvent( customEvent );

		if ( this.isFloatingButtonLibraryClose() ) {
			$e.internal( 'document/save/set-is-modified', { status: false } );
			window.location.href = elementor.config.admin_floating_button_admin_url;
		}
	}

	isFloatingButtonLibraryClose() {
		return window.elementor && elementor.config?.admin_floating_button_admin_url &&
			'floating-buttons' === elementor.config?.document?.type &&
			(
				this.$el
					.closest( '.dialog-lightbox-widget-content' )
					.find( '.elementor-template-library-template-floating_button' ).length ||
				this.$el
					.closest( '.dialog-lightbox-widget-content' )
					.find( '#elementor-template-library-preview' ).length ||
				this.$el
					.closest( '.dialog-lightbox-widget-content' )
					.find( '#elementor-template-library-templates-empty' ).length
			);
	}
}
