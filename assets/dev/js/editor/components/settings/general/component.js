import BaseComponent from 'elementor-common/components/component';

export default class Component extends BaseComponent {
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
