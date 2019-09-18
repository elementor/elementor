
$e.hooks.registerAfter( 'document/elements/settings', 'resize-column', ( args ) => {
	if ( args.settings._inline_size && ! args.isMultiSettings ) {
		const { containers = [ args.container ] } = args;

		containers.forEach( ( container ) => {
			const parentView = container.parent.view,
				columnView = container.view,
				currentSize = container.settings._previousAttributes._inline_size || container.settings._previousAttributes._column_size,
				newSize = args.settings._inline_size;

			parentView.resizeColumn( columnView, currentSize, newSize, false );
		} );
	}
} );
