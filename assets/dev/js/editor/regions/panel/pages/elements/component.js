export default class extends elementorModules.Component {
	activateTab( tab ) {
		elementor.getPanelView().setPage( 'elements' ).activateTab( tab );
	}

	getTabs() {
		return {
			categories: elementor.translate( 'categories' ),
			global: elementor.translate( 'global' ),
		};
	}
}
