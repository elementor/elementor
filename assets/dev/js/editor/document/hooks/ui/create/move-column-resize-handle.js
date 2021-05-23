import After from 'elementor-api/modules/hooks/ui/after';

export class MoveColumnResizeHandle extends After {
	getCommand() {
		return 'document/elements/create';
	}

	getId() {
		return 'move-column-resize-handle--document/elements/create';
	}

	getConditions( args ) {
		const { containers = [ args.container ] } = args,
			isDomOptimizationActive = elementorCommon.config.experimentalFeatures[ 'e_dom_optimization' ];

		if ( ! isDomOptimizationActive ) {
			return false;
		}

		// If the created element, was created at column.
		return containers.some( ( /**Container*/ container ) => (
			'column' === container.model.get( 'elType' )
		) );
	}

	apply( args ) {
		const { containers = [ args.container ] } = args;

		containers.forEach( ( /* Container */ container ) => {
			if ( 'column' === container.model.get( 'elType' ) ) {
				this.moveResizeHandle( container );
			}
		} );
	}

	/**
	 * Move the resize handle to prevent UI breaking.
	 *
	 * @param {Container} container - The column Container object.
	 *
	 * @returns {void}
	 */
	moveResizeHandle( container ) {
		// TODO: Find a better solution.
		const resizeHandle = container.view.$el.find( '> .ui-resizable-handle' );

		if ( resizeHandle.length > 0 ) {
			container.view.$el.prepend( resizeHandle );
		}
	}
}

export default MoveColumnResizeHandle;
