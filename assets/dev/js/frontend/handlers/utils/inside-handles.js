export default class InsideHandles extends elementorModules.frontend.handlers.Base {
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

	setHandlesPosition( insideHandleClass ) {
		const document = elementor.documents.getCurrent();

		if ( ! document || ! document.container.isEditable() ) {
			return;
		}

		if ( this.sectionInsideHandleClass === insideHandleClass && elementor.settings.page.model.attributes.scroll_snap ) {
			this.$element.addClass( insideHandleClass );
			return;
		}

		if ( ! this.isOverflowHidden() ) {
			return;
		}

		const offset = this.getOffset(),
			$handlesElement = this.$element.find( '> .elementor-element-overlay > .elementor-editor-section-settings' );

		this.$element.addClass( insideHandleClass );

		if ( offset < 25 ) {
			$handlesElement.css( 'top', offset < -5 ? -offset : '' );
		} else {
			this.$element.removeClass( insideHandleClass );
		}
	}
}
