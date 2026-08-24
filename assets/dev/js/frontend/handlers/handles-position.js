const handlesInsideClass = 'e-handles-inside';
const handlesHeight = 100;

export default class HandlesPosition extends elementorModules.frontend.handlers.Base {
	onInit() {
		this.$element.on( 'mouseenter', this.setHandlesPosition.bind( this ) );
	}

	isSectionScrollSnapEnabled() {
		return elementor.settings.page.model.attributes.scroll_snap;
	}

	isOverflowHidden() {
		return 'hidden' === this.$element.css( 'overflow' );
	}

	getEditAreaElement() {
		const $closestEditArea = this.$element.closest( '.elementor-edit-area-active' );

		if ( $closestEditArea.length ) {
			return $closestEditArea[ 0 ];
		}

		const document = elementor.documents.getCurrent();
		const $editArea = document?.$element;

		if ( $editArea?.length ) {
			return $editArea[ 0 ];
		}

		return this.$element.closest( '.elementor-edit-area' )[ 0 ];
	}

	getEditAreaOffset() {
		const editAreaElement = this.getEditAreaElement();

		if ( ! editAreaElement ) {
			return Number.POSITIVE_INFINITY;
		}

		return this.$element[ 0 ].getBoundingClientRect().top - editAreaElement.getBoundingClientRect().top;
	}

	setHandlesPosition() {
		const document = elementor.documents.getCurrent();

		if ( ! document?.container.isEditable() ) {
			return;
		}

		if ( this.isSectionScrollSnapEnabled() ) {
			this.$element.addClass( handlesInsideClass );
			return;
		}

		const viewportTop = this.$element[ 0 ].getBoundingClientRect().top;

		if ( viewportTop < handlesHeight || this.getEditAreaOffset() < handlesHeight || this.isOverflowHidden() ) {
			this.$element.addClass( handlesInsideClass );
		} else {
			this.$element.removeClass( handlesInsideClass );
		}
	}
}
