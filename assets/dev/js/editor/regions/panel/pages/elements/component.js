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

	renderTab( tab, args = {} ) {
		this.manager.setPage( 'elements', null, args ).showView( tab );
	}

	activateTab( tab ) {
		super.activateTab( tab );

		elementorCommon.eventsManager.dispatchEvent(
			elementorCommon.eventsManager.config.names.v1[ tab ],
			{
				location: elementorCommon.eventsManager.config.locations.widgetPanel,
				secondaryLocation: elementorCommon.eventsManager.config.secondaryLocations[ tab ],
				trigger: elementorCommon.eventsManager.config.triggers.click,
				element: elementorCommon.eventsManager.config.elements.accordionSection,
			},
		);
	}
}
