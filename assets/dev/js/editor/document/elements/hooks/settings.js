
$e.hooks.registerAfter( 'document/elements/settings', 'resize-column', ( args ) => {
	if ( ! args.settings._inline_size || args.isMultiSettings ) {
		return;
	}

	if ( args.settings._inline_size >= 100 ) {
		throw Error( '_inline_size cannot be more then 100.' );
	}

	const { containers = [ args.container ], options = {} } = args;

	if ( ! options.debounceHistory ) {
		options.debounceHistory = false;
	}

	containers.forEach( ( container ) => {
		if ( container.view.children.length >= 1 ) {
			throw Error( 'Could not resize one column.' );
		}

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
