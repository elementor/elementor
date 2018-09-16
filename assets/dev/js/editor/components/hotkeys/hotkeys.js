const Module = require( 'elementor-utils/module' );

import ModalLayout from './modal-layout';

export default class extends Module {
	onInit() {
		this.layout = new ModalLayout();

		this.addShortcut();
	}

	addShortcut() {
		const QUESTION_KEY = 191;

		elementorCommon.hotKeys.addHotKeyHandler( QUESTION_KEY, 'hotkeys', {
			isWorthHandling: ( event ) => elementorCommon.hotKeys.isControlEvent( event ),
			handle: () => this.layout.showModal(),
		} );
	}
}
