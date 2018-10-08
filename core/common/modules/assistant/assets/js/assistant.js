const Module = require( 'elementor-utils/module' );

import AssistantLayout from './modal-layout';

export default class extends Module {
	initLayout() {
		let layout;

		this.getLayout = () => {
			if ( ! layout ) {
				layout = new AssistantLayout();
			}

			return layout;
		};
	}

	addShortcut() {
		const E_KEY = 69;

		elementorCommon.hotKeys.addHotKeyHandler( E_KEY, 'assistant', {
			isWorthHandling: ( event ) => elementorCommon.hotKeys.isControlEvent( event ),
			handle: () => this.getLayout().showModal(),
		} );
	}

	onInit() {
		this.channel = Backbone.Radio.channel( 'ELEMENTOR:assistant' );

		this.initLayout();

		this.addShortcut();
	}
}
