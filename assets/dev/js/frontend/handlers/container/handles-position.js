/**
 * TODO: Try to merge with `section/handles-position.js` and create a generic solution using `.elementor-element`.
 */
export default class HandlesPosition extends elementorModules.frontend.handlers.Base {
	isActive() {
		return elementorFrontend.isEditMode();
	}

	onInit() {
		this.insideHandleClass = 'e-handles-inside';

		if ( ! this.isActive() ) {
			return;
		}

		this.$element.on( 'mouseenter', this.setHandlesPosition.bind( this, this.insideHandleClass ) );
	}
}
