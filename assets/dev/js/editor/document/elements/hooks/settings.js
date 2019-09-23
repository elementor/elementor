
$e.hooks.registerAfter( 'document/elements/settings', 'resize-column', ( args ) => {
	if ( ! args.settings._inline_size || args.isMultiSettings ) {
		return;
	}

	const { containers = [ args.container ], options = {} } = args;

	if ( ! options.debounceHistory ) {
		options.debounceHistory = false;
	}

	containers.forEach( ( container ) => {
		const parentView = container.parent.view,
			columnView = container.view,
			currentSize = container.settings._previousAttributes._inline_size || container.settings._previousAttributes._column_size,
			newSize = args.settings._inline_size;

		parentView.resizeColumn( columnView, currentSize, newSize, false, options.debounceHistory );
	} );
} );

$e.hooks.registerAfter( 'document/elements/settings', 'set-structure', ( args ) => {
	if ( ! args.settings.structure ) {
		return;
	}

	const { containers = [ args.container ] } = args;

	containers.forEach( ( container ) => {
		container.view.adjustColumns();
	} );
} );
