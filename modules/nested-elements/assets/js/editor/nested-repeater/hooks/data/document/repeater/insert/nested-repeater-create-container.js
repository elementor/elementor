import Base from '../base';

/**
 * Hook responsible for creating container element for the new created repeater item, and setting the `_title` setting.
 */
export class NestedRepeaterCreateContainer extends Base {
	getId() {
		return 'nested-repeater-create-container';
	}

	getCommand() {
		return 'document/repeater/insert';
	}

	apply( args ) {
		const { containers = [ args.container ] } = args;

		containers.forEach( ( container ) => {
			const newContainer = $e.run( 'document/elements/create', {
					container,
					model: {
						elType: 'container',
					},
					options: {
						edit: false, // Not losing focus.
					},
				} );

			this.applySettings(
				container.repeaters[ args.name ],
				newContainer,
				newContainer.parent.view.config.default_children_settings
			);
		} );
	}

	applySettings( repeater, container, settings ) {
		// TODO: Temporary solution, for applying the default settings to the new container.
		for ( const index in settings ) {
			if ( '_title' === index ) {
				settings[ index ] = sprintf( __( settings[ index ], 'elementor' ), repeater.children.length );
			} else {
				throw new Error( `Unknown default setting: '${ index }'` );
			}
		}

		$e.internal( 'document/elements/set-settings', {
			container,
			settings,
		} );
	}
}

export default NestedRepeaterCreateContainer;
