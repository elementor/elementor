const Module = require( 'elementor-utils/module' );

import AssistantLayout from './modal-layout';

export default class extends Module {
	onInit() {
		this.channel = Backbone.Radio.channel( 'ELEMENTOR:assistant' );

		this.layout = new AssistantLayout();

		this.addShortcut();
	}

	addShortcut() {
		const E_KEY = 69;

		elementorCommon.hotKeys.addHotKeyHandler( E_KEY, 'assistant', {
			isWorthHandling: ( event ) => elementorCommon.hotKeys.isControlEvent( event ),
			handle: () => this.layout.showModal(),
		} );
	}
}
