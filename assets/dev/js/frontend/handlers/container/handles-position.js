import InsideHandles from '../utils/inside-handles';

export default class HandlesPosition extends InsideHandles {
	onInit() {
		this.insideHandleClass = 'e-handles-inside';

		if ( ! this.isActive() ) {
			return;
		}

		this.$element.on( 'mouseenter', this.setHandlesPosition.bind( this, this.insideHandleClass ) );
	}
}
