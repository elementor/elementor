import BaseComponent from 'elementor-api/modules/component';

export default class BackwardsCompatibility {
	ensureTab( namespace, tabSlug, page = '' ) {
		let component = $e.components.get( namespace );

		if ( ! component ) {
			const Component = class extends BaseComponent {
				getNamespace() {
					return namespace;
				}

				renderTab( tab ) {
					elementor.getPanelView().setPage( page ).activateTab( tab );
				}
			};

			component = $e.components.register( new Component() );
		}

		if ( ! component.hasTab( tabSlug ) && elementor.config.tabs[ tabSlug ] ) {
			component.addTab( tabSlug, {
				title: elementor.config.tabs[ tabSlug ],
			} );
		}
	}
}
