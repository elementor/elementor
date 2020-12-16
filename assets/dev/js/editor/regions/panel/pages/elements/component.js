import ComponentBase from 'elementor-api/modules/component-base';

export default class Component extends ComponentBase {
	getNamespace() {
		return 'panel/elements';
	}

	defaultTabs() {
		return {
			categories: { title: __( 'Elements', 'elementor' ) },
			global: { title: __( 'Global', 'elementor' ) },
		};
	}

	getTabsWrapperSelector() {
		return '#elementor-panel-elements-navigation';
	}

	renderTab( tab ) {
		this.manager.setPage( 'elements' ).showView( tab );
	}
}
