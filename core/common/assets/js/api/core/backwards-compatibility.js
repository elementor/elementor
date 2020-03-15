import ComponentBase from 'elementor-api/modules/component-base';

export default class BackwardsCompatibility {
	constructor() {
		const eCommandsOnOrig = $e.commands.on,
			eCommandsInternalOnOrig = $e.commandsInternal.on;

		$e.commands.on = ( eventName, callback, context ) => {
			if ( 'run' === eventName ) {
				elementorCommon.helpers.softDeprecated(
					"$e.commands.on( 'run', ... )",
					'3.0.0',
					"$e.commands.on( 'run:before', ... )"
				);

				eCommandsOnOrig( 'run:before', callback, context );

				return;
			}

			eCommandsOnOrig( eventName, callback, context );
		};

		$e.commandsInternal.on = ( eventName, callback, context ) => {
			if ( 'run' === eventName ) {
				elementorCommon.helpers.softDeprecated(
					"$e.commandsInternal.on( 'run', ... )",
					'3.0.0',
					"$e.commandsInternal.on( 'run:before', ... )"
				);

				eCommandsInternalOnOrig( 'run:before', callback, context );

				return;
			}

			eCommandsInternalOnOrig( eventName, callback, context );
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
