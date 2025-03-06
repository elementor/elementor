const insideHandleClass = 'e-handles-inside';

export default class HandlesPosition extends elementorModules.frontend.handlers.Base {
	onInit() {
		this.$element.on( 'mouseenter', this.setHandlesPosition.bind( this ) );
	}

	isSectionScrollSnapEnabled() {
		return elementor.settings.page.model.attributes.scroll_snap;
	}

	isFirstElement() {
		return this.$element[ 0 ] === document.querySelector( '.elementor-section-wrap > .elementor-element:first-child' );
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

		if ( this.isSectionScrollSnapEnabled() ) {
			this.$element.addClass( insideHandleClass );

			return;
		}

		if ( ! this.isOverflowHidden() && ! this.isFirstElement() ) {
			this.$element.removeClass( insideHandleClass );

			return;
		}

		const offset = this.getOffset(),
			$handlesElement = this.$element.find( '> .elementor-element-overlay > .elementor-editor-section-settings' );

		if ( offset < 25 ) {
			this.$element.addClass( insideHandleClass );

			$handlesElement.css( 'top', offset < -5 ? -offset : '' );
		} else {
			this.$element.removeClass( insideHandleClass );
		}
	}
}
