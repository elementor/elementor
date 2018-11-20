const Module = require( 'elementor-utils/module' );

import ModalLayout from './modal-layout';

export default class extends Module {
	onInit() {
		this.layout = new ModalLayout();
	}

	show() {
		this.layout.showModal();
	}
}
