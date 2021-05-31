import After from 'elementor-api/modules/hooks/ui/after';

export class MoveColumnResizeHandle extends After {
	getCommand() {
		return 'document/elements/create';
	}

	getId() {
		return 'move-column-resize-handle--document/elements/create';
	}

	getContainerType() {
		return 'column';
	}

	getConditions() {
		// Trigger the hook only if DOM optimization experiment is active.
		return elementorCommon.config.experimentalFeatures[ 'e_dom_optimization' ];
	}

	apply( args ) {
		const { containers = [ args.container ] } = args;

		containers.forEach( ( /* Container */ container ) => {
			this.moveResizeHandle( container );
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
