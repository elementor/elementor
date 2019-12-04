import BaseComponent from 'elementor-common/components/component';

export default class Component extends BaseComponent {
	getNamespace() {
		return 'panel/elements';
	}

	defaultTabs() {
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
