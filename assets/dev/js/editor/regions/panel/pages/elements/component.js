export default class extends elementorModules.Component {
	getNamespace() {
		return 'panel/elements';
	}

	getTabs() {
		return {
			categories: { title: elementor.translate( 'elements' ) },
			global: { title: elementor.translate( 'global' ) },
		};
	}

	getTabsWrapperSelector() {
		return '#elementor-panel-elements-navigation';
	}

	renderTab( tab ) {
		this.context.setPage( 'elements' ).showView( tab );
	}
}
