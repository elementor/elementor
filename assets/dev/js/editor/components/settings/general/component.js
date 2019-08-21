export default class extends elementorModules.common.Component {
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
