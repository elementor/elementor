jQuery( () => {
	// Fake Testing.
	class _assert {
		constructor( name ) {
			this.name = name;
		}

		equals( a, b ) {
			if ( a === b ) {
				console.info( `Test: '${ this.name }' is equal` );
			} else {
				throw Error( `Test: '${ this.name }' is not equal` );
			}
		}
	}

	const QUnit = {
		test: ( ( name, fn ) => {
			setTimeout( () => {
				const assert = new _assert( name );

				console.info( `Testing Test: '${ name }'` );

				// Create section.
				const eSection = $e.run( 'document/elements/createSection', {
					columns: 1,
					returnValue: true,
				} );

				const eCol = eSection.children._views[ Object.keys( eSection.children._views )[ 0 ] ];

				$e.run( 'document/elements/create', {
					model: {
						elType: 'widget',
						widgetType: 'heading',
						settings: {
							title: `Testing ${ name } ->`,
							title_color: '#000000',
						},
					},
					element: eCol,

				} );

				fn( assert );
			} );
		} ),

		module: ( ( name ) => {
			elementor.elements.reset();

			alert( `Testing Module: '${ name } '` );
		} ),
	};

	QUnit.module( 'eCommands `document/elements/repeater`' );

	/** -------------------------------------------
	 * @description Test eCommands Repeater (Single Selection).
	 * -------------------------------------------- */

	QUnit.test( 'Insert', ( assert ) => {
		// Create section.
		const eSection = $e.run( 'document/elements/createSection', {
			columns: 1,
			returnValue: true,
		} );

		// Get col.
		const eCol = eSection.children._views[ Object.keys( eSection.children._views )[ 0 ] ];

		// Create tabs.
		const eTabs = $e.run( 'document/elements/create', {
			model: {
				elType: 'widget',
				widgetType: 'tabs',
			},
			element: eCol,
			returnValue: true,
		} );

		// Insert tab item.
		$e.run( 'document/elements/repeater/insert', {
			element: eTabs,
			model: {
				tab_title: 'Test Tab Title',
				tab_content: 'Test Tab Content',
			},
			name: 'tabs',
		} );

		// Check.
		assert.equals( eTabs.getEditModel().get( 'settings' ).get( 'tabs' ).length, 3 );
	} );

	QUnit.test( 'Remove', ( assert ) => {
		// Create section.
		const eSection = $e.run( 'document/elements/createSection', {
			columns: 1,
			returnValue: true,
		} );

		// Get col.
		const eCol = eSection.children._views[ Object.keys( eSection.children._views )[ 0 ] ];

		// Create tabs.
		const eTabs = $e.run( 'document/elements/create', {
			model: {
				elType: 'widget',
				widgetType: 'tabs',
			},
			element: eCol,
			returnValue: true,
		} );

		// Remove tab item.
		$e.run( 'document/elements/repeater/remove', {
			element: eTabs,
			index: 1,
			name: 'tabs',
		} );

		// Check.
		assert.equals( eTabs.getEditModel().get( 'settings' ).get( 'tabs' ).length, 1 );
	} );

	QUnit.test( 'Settings', ( assert ) => {
		// Create section.
		const eSection = $e.run( 'document/elements/createSection', {
			columns: 1,
			returnValue: true,
		} );

		// Get col.
		const eCol = eSection.children._views[ Object.keys( eSection.children._views )[ 0 ] ];

		// Create tabs.
		const eTabs = $e.run( 'document/elements/create', {
			model: {
				elType: 'widget',
				widgetType: 'tabs',
			},
			element: eCol,
			returnValue: true,
		} );

		const tabTitle = 'This is was changed';

		// Change tab item.
		$e.run( 'document/elements/repeater/settings', {
			element: eTabs,
			name: 'tabs',
			index: 1,
			settings: {
				tab_title: tabTitle,
			},
		} );

		// Check.
		assert.equals( eTabs.getEditModel().get( 'settings' ).get( 'tabs' ).at( 1 ).get( 'tab_title' ), tabTitle );
	} );

	QUnit.test( 'Duplicate', ( assert ) => {
		// Create section.
		const eSection = $e.run( 'document/elements/createSection', {
			columns: 1,
			returnValue: true,
		} );

		// Get col.
		const eCol = eSection.children._views[ Object.keys( eSection.children._views )[ 0 ] ];

		// Create tabs.
		const eTabs = $e.run( 'document/elements/create', {
			model: {
				elType: 'widget',
				widgetType: 'tabs',
			},
			element: eCol,
			returnValue: true,
		} );

		// Duplicate tab item.
		$e.run( 'document/elements/repeater/duplicate', {
			element: eTabs,
			name: 'tabs',
			index: 1,
		} );

		// Check.
		assert.equals( eTabs.getEditModel().get( 'settings' ).get( 'tabs' ).length, 3 );
	} );

	QUnit.test( 'Move', ( assert ) => {
		// Create section.
		const eSection = $e.run( 'document/elements/createSection', {
			columns: 1,
			returnValue: true,
		} );

		// Get col.
		const eCol = eSection.children._views[ Object.keys( eSection.children._views )[ 0 ] ];

		// Create tabs.
		const eTabs = $e.run( 'document/elements/create', {
			model: {
				elType: 'widget',
				widgetType: 'tabs',
			},
			element: eCol,
			returnValue: true,
		} );

		// Move tab item.
		$e.run( 'document/elements/repeater/move', {
			element: eTabs,
			name: 'tabs',
			sourceIndex: 1,
			targetIndex: 0,
		} );

		// Check.
		assert.equals( eTabs.getEditModel().get( 'settings' ).get( 'tabs' ).at( 0 ).get( 'tab_title' ), 'Tab #2' );
	} );
} );
