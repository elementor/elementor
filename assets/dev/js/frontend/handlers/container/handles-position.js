/**
 * TODO: Try to merge with `section/handles-position.js` and create a generic solution using `.elementor-element`.
 */
export default class HandlesPosition extends elementorModules.frontend.handlers.Base {
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

		if ( ! this.isOverflowHidden() ) {
			return;
		}

		const offset = this.getOffset(),
			$handlesElement = this.$element.find( '> .elementor-element-overlay > .elementor-editor-section-settings' ),
			insideHandleClass = 'e-handles-inside';

		if ( offset < 25 ) {
			this.$element.addClass( insideHandleClass );

			$handlesElement.css( 'top', offset < -5 ? -offset : '' );
		} else {
			this.$element.removeClass( insideHandleClass );
		}
	}

	onInit() {
		if ( ! this.isActive() ) {
			return;
		}

		this.$element.on( 'mouseenter', this.setHandlesPosition.bind( this ) );
	}
}
