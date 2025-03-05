import InsideHandles from '../utils/inside-handles';

export default class HandlesPosition extends InsideHandles {
	isActive() {
		return elementorFrontend.isEditMode();
	}

	onInit() {
		this.insideHandleClass = 'elementor-section--handles-inside';

		if ( ! this.isActive() ) {
			return;
		}

		this.$element.on( 'mouseenter', this.setHandlesPosition.bind( this, this.insideHandleClass ) );
	}
}
