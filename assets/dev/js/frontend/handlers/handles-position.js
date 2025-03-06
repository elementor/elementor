export default class HandlesPosition extends elementorModules.frontend.handlers.Base {
	onInit() {
		if ( ! this.isActive() ) {
			return;
		}

		this.insideHandleClass = this.isElementTypeSection() ? 'elementor-section--handles-inside' : 'e-handles-inside';

		this.$element.on( 'mouseenter', this.setHandlesPosition.bind( this ) );
	}

	isElementTypeSection() {
		return 'section' === this.getElementType();
	}

	isSectionScrollSnagged() {
		return elementor.settings.page.model.attributes.scroll_snap;
	}

	isFirstElement() {
		const selector = this.isElementTypeSection() ? '.elementor-top-section' : '.e-con:first-child';

		return this.$element[ 0 ] === document.querySelector( `.elementor-edit-mode ${ selector }` );
	}

	isActive() {
		return elementorFrontend.isEditMode();
	}

	isOverflowHidden() {
		return 'hidden' === this.$element.css( 'overflow' );
	}

	getOffset() {
		if ( 'body' === elementor.config.document.container ) {
			return this.$element.offset().top;
		}

		const $container = jQuery( elementor.config.document.container );
		return this.$element.offset().top - $container.offset().top;
	}

	setHandlesPosition() {
		const document = elementor.documents.getCurrent();

		if ( ! document || ! document.container.isEditable() ) {
			return;
		}

		if ( this.isElementTypeSection() && this.isSectionScrollSnagged() ) {
			this.$element.addClass( this.insideHandleClass );

			return;
		}

		if ( ! this.isOverflowHidden() && ! this.isFirstElement() ) {
			return;
		}

		const offset = this.getOffset(),
			$handlesElement = this.$element.find( '> .elementor-element-overlay > .elementor-editor-section-settings' );

		this.$element.addClass( this.insideHandleClass );

		if ( offset < 25 ) {
			$handlesElement.css( 'top', offset < -5 ? -offset : '' );
		} else {
			this.$element.removeClass( this.insideHandleClass );
		}
	}
}
