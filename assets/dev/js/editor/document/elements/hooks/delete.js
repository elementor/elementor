$e.hooks.registerAfter( 'document/elements/delete', 'handle-section', ( args, containers ) => {
	if ( ! Array.isArray( containers ) ) {
		containers = [ containers ];
	}

	containers.forEach( ( container ) => {
		const parent = container.parent;

		if ( 'section' !== parent.model.get( 'elType' ) ) {
			return;
		}

		if ( 0 === parent.view.collection.length ) {
			$e.run( 'document/elements/create', {
				container: parent,
				model: {
					elType: 'column',
				},
			} );
		} else {
			parent.view.resetLayout();
		}
	} );
} );
