export default class extends elementorModules.Component {
	getNamespace() {
		return 'panel/elements';
	}

	getInitialTabs() {
		return {
			categories: { title: elementor.translate( 'elements' ) },
			global: { title: elementor.translate( 'global' ) },
		};
	}

	getTabsWrapperSelector() {
		return '#elementor-panel-elements-navigation';
	}

	renderTab( tab ) {
		this.manager.setPage( 'elements' ).showView( tab );
	}
}
