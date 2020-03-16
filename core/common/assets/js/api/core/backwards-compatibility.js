import ComponentBase from 'elementor-api/modules/component-base';

export default class BackwardsCompatibility {
	/**
	 * @param {API} api
	 */
	constructor( api ) {
		this.api = api;

		this.addDeprecatedModules();
	}

	addDeprecatedModules() {
		const { modules } = this.api;

		Object.defineProperty( modules, 'CommandBase', {
				get() {
					elementorCommon.helpers.softDeprecated( '$e.modules.CommandBase', '2.9.0',
						'$e.modules.CommandHookable' );
					return modules.CommandHookable;
				},
		} );

		Object.defineProperty( modules, 'CommandInternalBase', {
			get() {
				elementorCommon.helpers.softDeprecated( '$e.modules.CommandInternalBase', '2.9.0',
					'$e.modules.CommandInternal' );
				return modules.CommandInternal;
			},
		} );
	}

	ensureTab( namespace, tabSlug, page = '' ) {
		let component = $e.components.get( namespace );

		if ( ! component ) {
			const Component = class extends ComponentBase {
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
