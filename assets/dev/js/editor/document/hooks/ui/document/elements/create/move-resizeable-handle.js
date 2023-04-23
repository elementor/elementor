import After from 'elementor-api/modules/hooks/ui/after';

/**
 * Move jQuery UI Resizeable handle to the end each time an element is created inside
 * a Container, since it causes UI issues and breaks some CSS selectors.
 */
export class MoveResizeableHandle extends After {
	getCommand() {
		return 'document/elements/create';
	}

	getId() {
		return 'move-resizeable-handle';
	}

	getConditions( args ) {
		const { containers = [ args.container ] } = args;

		// If the element was created in a Container.
		return containers.some( ( /** Container*/ container ) => (
			'container' === container.model.get( 'elType' )
		) );
	}

	apply( args ) {
		const { containers = [ args.container ] } = args;

		containers.forEach( ( /* Container */ container ) => {
			const { $el } = container.view,
				$resizeHandle = $el.find( '> .ui-resizable-handle' ).first();

			if ( ! $resizeHandle ) {
				return;
			}

			// Move the handle to the end.
			$el.append( $resizeHandle );
		} );
	}
}

export default MoveResizeableHandle;
