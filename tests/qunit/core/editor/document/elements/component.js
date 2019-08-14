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

				fn( assert );
			} );
		} ),

		module: ( ( name ) => {
			elementor.elements.reset();

			alert( `Testing Module: '${ name } '` );
		} ),
	};

	QUnit.module( 'eCommands' );

	/** -------------------------------------------
	 * @description Test eQuery Commands (Single Selection).
	 * -------------------------------------------- */

	QUnit.test( 'Settings', ( assert ) => {
		// Create section.
		const eSection = $e.run( 'elements/createSection', {
			columns: 1,
			returnValue: true,
		} );

		// Create column.
		const eCol = $e.run( 'elements/create', {
			element: eSection,
			options: {
				edit: false,
			},
			returnValue: true,
		} );

		// Create button.
		const eButton = $e.run( 'elements/create', {
			data: {
				elType: 'widget',
				widgetType: 'button',
				settings: {
					text: 'You can copy me',
					background_color: '#000000',
				},
			},
			element: eCol,
			options: {
				edit: false,
			},
			returnValue: true,
		} );

		// Change button text.
		$e.run( 'elements/settings', {
			element: eButton,
			settings: {
				text: 'i test it',
			},
		} );

		// Check button text.
		assert.equals( eButton.model.attributes.settings.attributes.text, 'i test it' );
	} );

	QUnit.test( 'Create Section', ( assert ) => {
		// Create section.
		const eSection = $e.run( 'elements/createSection', {
			returnValue: true,
		} );

		// Check section exist.
		assert.equals( Boolean( elementor.getPreviewView().children.findByModel( eSection.model ) ), true );
	} );

	QUnit.test( 'Create Column', ( assert ) => {
		// Create section.
		const eSection = $e.run( 'elements/createSection', {
			columns: 1,
			returnValue: true,
		} );

		// Create column.
		const eCol = $e.run( 'elements/create', {
			element: eSection,
			options: {
				edit: false,
			},
			returnValue: true,
		} );

		// Check column exist.
		assert.equals( elementor.getPreviewView().children.some( ( a ) => {
			return a.children.findByModel( eCol.model )
		} ), true );
	} );

	QUnit.test( 'Create Widget', ( assert ) => {
		// Create section.
		const eSection = $e.run( 'elements/createSection', {
			returnValue: true,
		} );

		// Create column.
		const eCol = $e.run( 'elements/create', {
			element: eSection,
			options: {
				edit: false,
			},
			returnValue: true,
		} );

		// Create Button.
		const eButton = $e.run( 'elements/create', {
			data: {
				elType: 'widget',
				widgetType: 'button',
				settings: {
					text: 'hey',
				},
			},
			element: eCol,
			options: {
				edit: false,
			},
			returnValue: true,
		} );

		// Check button exist.
		assert.equals( Boolean( eCol.children.findByModel( eButton.model ) ), true );
	} );

	QUnit.test( 'Duplicate', ( assert ) => {
		// Create section.
		const eSection = $e.run( 'elements/createSection', {
			returnValue: true,
		} );

		// Create column.
		const eCol = $e.run( 'elements/create', {
			element: eSection,
			options: {
				edit: false,
			},
			returnValue: true,
		} );

		// Create button.
		const eButton = $e.run( 'elements/create', {
			data: {
				elType: 'widget',
				widgetType: 'button',
				settings: {
					text: 'hey',
				},
			},
			element: eCol,
			options: {
				edit: false,
			},
			returnValue: true,
		} );

		// Duplicate button.
		$e.run( 'elements/duplicate', {
			element: eButton,
		} );

		// Check duplicated button exist.
		assert.equals( eCol.children.length, 2 );
	} );

	QUnit.test( 'Copy & Paste', ( assert ) => {
		// Create section.
		const eSection = $e.run( 'elements/createSection', {
			returnValue: true,
		} );

		// Create column.
		const eCol = $e.run( 'elements/create', {
			element: eSection,
			options: {
				edit: false,
			},
			returnValue: true,
		} );

		// Create button.
		const eButton = $e.run( 'elements/create', {
			data: {
				elType: 'widget',
				widgetType: 'button',
				settings: {
					text: 'hey',
				},
			},
			element: eCol,
			options: {
				edit: false,
			},
			returnValue: true,
		} );

		// Copy button.
		$e.run( 'elements/copy', {
			element: eButton,
		} );

		// Paste button
		$e.run( 'elements/paste', {
			element: eCol,
		} );

		// Check pasted button exist.
		assert.equals( eCol.children.length, 2 );
	} );

	QUnit.test( 'Paste Style', ( assert ) => {
		// Create section.
		const eSection = $e.run( 'elements/createSection', {
			returnValue: true,
		} );

		// Create column.
		const eCol = $e.run( 'elements/create', {
			element: eSection,
			options: {
				edit: false,
			},
			returnValue: true,
		} );

		// Create button.
		const eButtonSimple = $e.run( 'elements/create', {
			data: {
				elType: 'widget',
				widgetType: 'button',
				settings: {
					text: 'hey',
				},
			},
			element: eCol,
			options: {
				edit: false,
			},
			returnValue: true,
		} );

		// Create button with style.
		const eButtonStyled = $e.run( 'elements/create', {
			data: {
				elType: 'widget',
				widgetType: 'button',
				settings: {
					text: 'You can copy me',
					background_color: '#000000',
				},
			},
			element: eCol,
			options: {
				edit: false,
			},
			returnValue: true,
		} );

		// Copy styled button.
		$e.run( 'elements/copy', {
			element: eButtonStyled,
		} );

		// Paste style to simple button.
		$e.run( 'elements/pasteStyle', {
			element: eButtonSimple,
		} );

		// Check pasted style exist.
		assert.equals( eButtonSimple.model.attributes.settings.attributes.background_color, '#000000' );
	} );

	QUnit.test( 'Reset Style', ( assert ) => {
		// Create section.
		const eSection = $e.run( 'elements/createSection', {
			returnValue: true,
		} );

		// Create column.
		const eCol = $e.run( 'elements/create', {
			element: eSection,
			options: {
				edit: false,
			},
			returnValue: true,
		} );

		// Create button with style.
		const eButtonStyled = $e.run( 'elements/create', {
			data: {
				elType: 'widget',
				widgetType: 'button',
				settings: {
					text: 'You can copy me',
					background_color: '#000000',
				},
			},
			element: eCol,
			options: {
				edit: false,
			},
			returnValue: true,
		} );

		// Paste style to simple button.
		$e.run( 'elements/resetStyle', {
			element: eButtonStyled,
		} );

		// Check pasted style exist.
		assert.equals( eButtonStyled.model.attributes.settings.attributes.background_color, '' );
	} );

	QUnit.test( 'Move', ( assert ) => {
		// Create section.
		const eSection = $e.run( 'elements/createSection', {
			returnValue: true,
		} );

		// Create column 1.
		const eCol1 = $e.run( 'elements/create', {
			element: eSection,
			options: {
				edit: false,
			},
			returnValue: true,
		} );

		// Create column 2.
		const eCol2 = $e.run( 'elements/create', {
			element: eSection,
			options: {
				edit: false,
			},
			returnValue: true,
		} );

		// Create button at column1.
		const eButton = $e.run( 'elements/create', {
			data: {
				elType: 'widget',
				widgetType: 'button',
				settings: {
					text: 'You can copy me',
					background_color: '#000000',
				},
			},
			element: eCol1,
			options: {
				edit: false,
			},
			returnValue: true,
		} );

		// Move button to eCol2.
		$e.run( 'elements/move', {
			element: eButton,
			target: eCol2,
		} );

		// Validate.
		assert.equals( eCol1.collection.length, 0 );
		assert.equals( eCol2.collection.length, 1 );
	} );

	QUnit.test( 'Delete', ( assert ) => {
		// Create section.
		const eSection = $e.run( 'elements/createSection', {
			returnValue: true,
		} );

		// Create column.
		const eCol = $e.run( 'elements/create', {
			element: eSection,
			options: {
				edit: false,
			},
			returnValue: true,
		} );

		// Create button 1.
		const eButton1 = $e.run( 'elements/create', {
			data: {
				elType: 'widget',
				widgetType: 'button',
				settings: {
					text: 'You can copy me',
					background_color: '#000000',
				},
			},
			element: eCol,
			options: {
				edit: false,
			},
			returnValue: true,
		} );

		// Create button 2.
		const eButton2 = $e.run( 'elements/create', {
			data: {
				elType: 'widget',
				widgetType: 'button',
				settings: {
					text: 'You can copy me',
					background_color: '#000000',
				},
			},
			element: eCol,
			options: {
				edit: false,
			},
			returnValue: true,
		} );

		// Delete button 1.
		$e.run( 'elements/delete', {
			element: eButton1,
		} );

		// Validate.
		assert.equals( eCol.collection.length, 1 );

		// Delete button 2.
		$e.run( 'elements/delete', {
			element: eButton2,
		} );

		// Validate.
		assert.equals( eCol.collection.length, 0 );
	} );

	QUnit.test( 'Copy All', ( assert ) => {
		setTimeout( () => {
			// Create section.
			const eSection = $e.run( 'elements/createSection', {
				returnValue: true,
			} );

			// Create column.
			const eCol = $e.run( 'elements/create', {
				element: eSection,
				options: {
					edit: false,
				},
				returnValue: true,
			} );

			// Create button 1.
			const eButton1 = $e.run( 'elements/create', {
				data: {
					elType: 'widget',
					widgetType: 'button',
					settings: {
						text: 'You can copy me',
						background_color: '#000000',
					},
				},
				element: eCol,
				options: {
					edit: false,
				},
				returnValue: true,
			} );

			// Create button 2.
			const eButton2 = $e.run( 'elements/create', {
				data: {
					elType: 'widget',
					widgetType: 'button',
					settings: {
						text: 'You can copy me',
						background_color: '#000000',
					},
				},
				element: eCol,
				options: {
					edit: false,
				},
				returnValue: true,
			} );

			// Copy all.
			$e.run( 'elements/copyAll' );

			// Paste.
			$e.run( 'elements/paste', {
				element: elementor.getPreviewView(),
				rebuild: true,
			} );

			setTimeout( () => {
				assert.equals( elementor.getPreviewView().collection.length, 2 );
			} );
		} );
	} );

	QUnit.test( 'Empty', ( assert ) => {
		// Create section.
		const eSection = $e.run( 'elements/createSection', {
			returnValue: true,
		} );

		// Create column.
		const eCol = $e.run( 'elements/create', {
			element: eSection,
			options: {
				edit: false,
			},
			returnValue: true,
		} );

		// Create button 1.
		const eButton1 = $e.run( 'elements/create', {
			data: {
				elType: 'widget',
				widgetType: 'button',
				settings: {
					text: 'You can copy me',
					background_color: '#000000',
				},
			},
			element: eCol,
			options: {
				edit: false,
			},
			returnValue: true,
		} );

		// Create button 2.
		const eButton2 = $e.run( 'elements/create', {
			data: {
				elType: 'widget',
				widgetType: 'button',
				settings: {
					text: 'You can copy me',
					background_color: '#000000',
				},
			},
			element: eCol,
			options: {
				edit: false,
			},
			returnValue: true,
		} );

		// Remove all.
		$e.run( 'elements/empty', { force: true } );

		// Check.
		assert.equals( elementor.getPreviewView().collection.length, 0 );
	} );

	// TODO: test import
} );
