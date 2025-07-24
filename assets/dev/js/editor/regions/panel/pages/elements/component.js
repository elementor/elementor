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
		if ( 'global' === tab ) {
			const page = this.manager.setPage( 'elements', null, args );
			page.showView( 'globalWidgets' );
			page.showView( 'globalComponents' );
			return;
		}

		this.manager.setPage( 'elements', null, args ).showView( tab );
	}

	activateTab( tab ) {
		super.activateTab( tab );

		elementor.editorEvents.dispatchEvent(
			elementor.editorEvents.config.names.v1[ tab ],
			{
				location: elementor.editorEvents.config.locations.widgetPanel,
				secondaryLocation: elementor.editorEvents.config.secondaryLocations[ tab ],
				trigger: elementor.editorEvents.config.triggers.click,
				element: elementor.editorEvents.config.elements.accordionSection,
			},
		);
	}
}
