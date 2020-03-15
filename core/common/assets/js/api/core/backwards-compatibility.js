import ComponentBase from 'elementor-api/modules/component-base';

export default class BackwardsCompatibility {
	constructor() {
		const onOrig = $e.commands.on;

		$e.commands.on = ( eventName, callback, context ) => {
			if ( 'run' === eventName ) {
				elementorCommon.helpers.softDeprecated(
					"$e.commands.on( 'run', ... )",
					'3.0.0',
					"$e.commands.on( 'run:before', ... )"
				);

				onOrig( 'run:before', callback, context );

				return;
			}

			onOrig( eventName, callback, context );
		};
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
