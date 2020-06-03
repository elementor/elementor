import ComponentBase from 'elementor-api/modules/component-base';

export default class Component extends ComponentBase {
	getNamespace() {
		return 'panel/general-settings';
	}

	defaultTabs() {
		return {
			style: { title: elementor.translate( 'style' ) },
			lightbox: { title: elementor.translate( 'lightbox' ) },
		};
	}

	renderTab( tab ) {
		elementor.getPanelView().setPage( 'general_settings' ).activateTab( tab );
	}
}
