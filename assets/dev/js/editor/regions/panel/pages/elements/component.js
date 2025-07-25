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

		elementorCommon.editorEvents.dispatchEvent(
			elementorCommon.editorEvents.config.names.v1[ tab ],
			{
				location: elementorCommon.editorEvents.config.locations.widgetPanel,
				secondaryLocation: elementorCommon.editorEvents.config.secondaryLocations[ tab ],
				trigger: elementorCommon.editorEvents.config.triggers.click,
				element: elementorCommon.editorEvents.config.elements.accordionSection,
			},
		);
	}
}
