// Limit max columns.
$e.hooks.registerDependency( 'document/elements/create', 'limit-max-columns', ( args ) => {
	if ( ! args.model || 'column' !== args.model.elType ) {
		return true;
	}

	const { containers = [ args.container ] } = args;

	return ! containers.some( ( container ) => {
		return container.view.isCollectionFilled();
	} );
} );

// Create section.
$e.hooks.registerAfter( 'document/elements/create', 'create-section-columns', ( args, containers ) => {
	if ( ! args.model || 'section' !== args.model.elType || args.model.elements ) {
		return;
	}

	const { structure = false, options = {} } = args;

	if ( ! Array.isArray( containers ) ) {
		containers = [ containers ];
	}

	let { columns = 1 } = args;

	if ( args.model.isInner && 1 === columns ) {
		columns = containers[ 0 ].view.defaultInnerSectionColumns;
	}

	for ( let loopIndex = 0; loopIndex < columns; loopIndex++ ) {
		$e.run( 'document/elements/create', {
			containers,
			options,
			model: {
				id: elementor.helpers.getUniqueID(),
				elType: 'column',
				settings: {},
				elements: [],
			},
		} );
	}

	if ( structure ) {
		containers.forEach( ( container ) => {
			container.view.setStructure( structure );

			// Focus on last container.
			container.model.trigger( 'request:edit' );
		} );
	}
} );

// Reset layout.
$e.hooks.registerAfter( 'document/elements/create', 'reset-section-layout', ( args, result ) => {
	if ( ! args.model || 'column' !== args.model.elType ) {
		return;
	}

	if ( ! Array.isArray( result ) ) {
		result = [ result ];
	}

	result.forEach( ( createdContainer ) => createdContainer.parent.view.resetLayout() );
} );

