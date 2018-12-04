const Module = require( 'elementor-utils/module' );

import ModalLayout from './modal-layout';

export default class extends Module {
	onInit() {
		this.layout = new ModalLayout();
		this.layout.getModal().addButton( {
			name: 'insert_icon',
			className: 'elementor-button',
			text: elementor.translate( 'Insert' ),
			callback: ( modal ) => {
				this.updateControlValue( modal.getSettings( 'controlModel' ), this.layout.modalContent.currentView );
			},
		} );
	}

	updateControlValue( model, view ) {
		model.setValue( {
			value: view.cache.value,
			library: view.cache.type,
		} );
		model.applySavedValue();
	}

	show( options ) {
		this.layout.showModal( options );
	}
}
