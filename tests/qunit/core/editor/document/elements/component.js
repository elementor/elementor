jQuery( () => {
	QUnit.module( 'Component: document/elements', () => {
		QUnit.module( 'Single Selection', () => {
			QUnit.test( 'Empty', ( assert ) => {
				// Create section.
				const eSection = $e.run( 'document/elements/createSection', {
					returnValue: true,
				} );

				// Create column.
				const eCol = $e.run( 'document/elements/create', {
					model: {
						elType: 'column',
					},
					element: eSection,
					returnValue: true,
				} );

				// Create button 1.
				$e.run( 'document/elements/create', {
					model: {
						elType: 'widget',
						widgetType: 'button',
						settings: {
							text: 'You can copy me',
							background_color: '#000000',
						},
					},
					element: eCol,
					returnValue: true,
				} );

				// Create button 2.
				$e.run( 'document/elements/create', {
					model: {
						elType: 'widget',
						widgetType: 'button',
						settings: {
							text: 'You can copy me',
							background_color: '#000000',
						},
					},
					element: eCol,
					returnValue: true,
				} );

				// Remove all.
				$e.run( 'document/elements/empty', { force: true } );

				// Check.
				assert.equal( elementor.getPreviewView().collection.length, 0 );
			} );

			QUnit.test( 'Copy All', ( assert ) => {
				// Create section.
				const eSection = $e.run( 'document/elements/createSection', {
					returnValue: true,
				} );

				// Create column.
				const eCol = $e.run( 'document/elements/create', {
					model: {
						elType: 'column',
					},
					element: eSection,
					returnValue: true,
				} );

				// Create button 1.
				$e.run( 'document/elements/create', {
					model: {
						elType: 'widget',
						widgetType: 'button',
						settings: {
							text: 'You can copy me',
							background_color: '#000000',
						},
					},
					element: eCol,
					returnValue: true,
				} );

				// Create button 2.
				$e.run( 'document/elements/create', {
					model: {
						elType: 'widget',
						widgetType: 'button',
						settings: {
							text: 'You can copy me',
							background_color: '#000000',
						},
					},
					element: eCol,
					returnValue: true,
				} );

				// Copy all.
				$e.run( 'document/elements/copyAll' );

				// Paste.
				$e.run( 'document/elements/paste', {
					element: elementor.getPreviewView(),
					rebuild: true,
				} );

				assert.equal( eSection.collection.length, 2 );
			} );

			QUnit.test( 'Settings', ( assert ) => {
				// Create section.
				const eSection = $e.run( 'document/elements/createSection', {
					columns: 1,
					returnValue: true,
				} );

				// Create column.
				const eCol = $e.run( 'document/elements/create', {
					model: {
						elType: 'column',
					},
					element: eSection,
					returnValue: true,
				} );

				// Create button.
				const eButton = $e.run( 'document/elements/create', {
					model: {
						elType: 'widget',
						widgetType: 'button',
						settings: {
							text: 'You can copy me',
							background_color: '#000000',
						},
					},
					element: eCol,
					returnValue: true,
				} );

				// Change button text.
				$e.run( 'document/elements/settings', {
					element: eButton,
					settings: {
						text: 'i test it',
					},
				} );

				// Check button text.
				assert.equal( eButton.model.attributes.settings.attributes.text, 'i test it' );
			} );

			QUnit.test( 'Create Section', ( assert ) => {
				// Create section.
				const eSection = $e.run( 'document/elements/createSection', {
					returnValue: true,
				} );

				// Check section exist.
				assert.equal( Boolean( elementor.getPreviewView().children.findByModel( eSection.model ) ), true );
			} );

			QUnit.test( 'Create Column', ( assert ) => {
				// Create section.
				const eSection = $e.run( 'document/elements/createSection', {
					columns: 1,
					returnValue: true,
				} );

				// Create column.
				const eCol = $e.run( 'document/elements/create', {
					model: {
						elType: 'column',
					},
					element: eSection,
					returnValue: true,
				} );

				// Check column exist.
				assert.equal( elementor.getPreviewView().children.some( ( a ) => {
					return a.children.findByModel( eCol.model );
				} ), true );
			} );

			QUnit.test( 'Create Widget', ( assert ) => {
				// Create section.
				const eSection = $e.run( 'document/elements/createSection', {
					returnValue: true,
				} );

				// Create column.
				const eCol = $e.run( 'document/elements/create', {
					model: {
						elType: 'column',
					},
					element: eSection,
					returnValue: true,
				} );

				// Create Button.
				const eButton = $e.run( 'document/elements/create', {
					model: {
						elType: 'widget',
						widgetType: 'button',
						settings: {
							text: 'hey',
						},
					},
					element: eCol,
					returnValue: true,
				} );

				// Check button exist.
				assert.equal( Boolean( eCol.children.findByModel( eButton.model ) ), true );
			} );

			QUnit.test( 'Duplicate', ( assert ) => {
				// Create section.
				const eSection = $e.run( 'document/elements/createSection', {
					returnValue: true,
				} );

				// Create column.
				const eCol = $e.run( 'document/elements/create', {
					model: {
						elType: 'column',
					},
					element: eSection,
					returnValue: true,
				} );

				// Create button.
				const eButton = $e.run( 'document/elements/create', {
					model: {
						elType: 'widget',
						widgetType: 'button',
						settings: {
							text: 'hey',
						},
					},
					element: eCol,
					returnValue: true,
				} );

				// Duplicate button.
				$e.run( 'document/elements/duplicate', {
					element: eButton,
				} );

				// Check duplicated button exist.
				assert.equal( eCol.children.length, 2 );
			} );

			QUnit.test( 'Copy & Paste', ( assert ) => {
				// Create section.
				const eSection = $e.run( 'document/elements/createSection', {
					returnValue: true,
				} );

				// Create column.
				const eCol = $e.run( 'document/elements/create', {
					model: {
						elType: 'column',
					},
					element: eSection,
					returnValue: true,
				} );

				// Create button.
				const eButton = $e.run( 'document/elements/create', {
					model: {
						elType: 'widget',
						widgetType: 'button',
						settings: {
							text: 'hey',
						},
					},
					element: eCol,
					returnValue: true,
				} );

				// Copy button.
				$e.run( 'document/elements/copy', {
					element: eButton,
				} );

				// Paste button
				$e.run( 'document/elements/paste', {
					element: eCol,
				} );

				// Check pasted button exist.
				assert.equal( eCol.children.length, 2 );
			} );

			QUnit.test( 'Paste Style', ( assert ) => {
				// Create section.
				const eSection = $e.run( 'document/elements/createSection', {
					returnValue: true,
				} );

				// Create column.
				const eCol = $e.run( 'document/elements/create', {
					model: {
						elType: 'column',
					},
					element: eSection,
					returnValue: true,
				} );

				// Create button.
				const eButtonSimple = $e.run( 'document/elements/create', {
					model: {
						elType: 'widget',
						widgetType: 'button',
						settings: {
							text: 'hey',
						},
					},
					element: eCol,
					returnValue: true,
				} );

				// Create button with style.
				const eButtonStyled = $e.run( 'document/elements/create', {
					model: {
						elType: 'widget',
						widgetType: 'button',
						settings: {
							text: 'You can copy me',
							background_color: '#000000',
						},
					},
					element: eCol,
					returnValue: true,
				} );

				// Copy styled button.
				$e.run( 'document/elements/copy', {
					element: eButtonStyled,
				} );

				// Paste style to simple button.
				$e.run( 'document/elements/pasteStyle', {
					element: eButtonSimple,
				} );

				// Check pasted style exist.
				assert.equal( eButtonSimple.model.attributes.settings.attributes.background_color, '#000000' );
			} );

			QUnit.test( 'Reset Style', ( assert ) => {
				// Create section.
				const eSection = $e.run( 'document/elements/createSection', {
					returnValue: true,
				} );

				// Create column.
				const eCol = $e.run( 'document/elements/create', {
					model: {
						elType: 'column',
					},
					element: eSection,
					returnValue: true,
				} );

				// Create button with style.
				const eButtonStyled = $e.run( 'document/elements/create', {
					model: {
						elType: 'widget',
						widgetType: 'button',
						settings: {
							text: 'You can copy me',
							background_color: '#000000',
						},
					},
					element: eCol,
					returnValue: true,
				} );

				// Paste style to simple button.
				$e.run( 'document/elements/resetStyle', {
					element: eButtonStyled,
				} );

				// Check pasted style exist.
				assert.equal( eButtonStyled.model.attributes.settings.attributes.background_color, '' );
			} );

			QUnit.test( 'Move', ( assert ) => {
				// Create section.
				const eSection = $e.run( 'document/elements/createSection', {
					returnValue: true,
				} );

				// Create column 1.
				const eCol1 = $e.run( 'document/elements/create', {
					model: {
						elType: 'column',
					},
					element: eSection,
					returnValue: true,
				} );

				// Create column 2.
				const eCol2 = $e.run( 'document/elements/create', {
					model: {
						elType: 'column',
					},
					element: eSection,
					returnValue: true,
				} );

				// Create button at column1.
				const eButton = $e.run( 'document/elements/create', {
					model: {
						elType: 'widget',
						widgetType: 'button',
						settings: {
							text: 'You can copy me',
							background_color: '#000000',
						},
					},
					element: eCol1,
					returnValue: true,
				} );

				// Move button to eCol2.
				$e.run( 'document/elements/move', {
					element: eButton,
					target: eCol2,
				} );

				// Validate.
				assert.equal( eCol1.collection.length, 0 );
				assert.equal( eCol2.collection.length, 1 );
			} );

			QUnit.test( 'Delete', ( assert ) => {
				// Create section.
				const eSection = $e.run( 'document/elements/createSection', {
					returnValue: true,
				} );

				// Create column.
				const eCol = $e.run( 'document/elements/create', {
					model: {
						elType: 'column',
					},
					element: eSection,
					returnValue: true,
				} );

				// Create button 1.
				const eButton1 = $e.run( 'document/elements/create', {
					model: {
						elType: 'widget',
						widgetType: 'button',
						settings: {
							text: 'You can copy me',
							background_color: '#000000',
						},
					},
					element: eCol,
					returnValue: true,
				} );

				// Create button 2.
				const eButton2 = $e.run( 'document/elements/create', {
					model: {
						elType: 'widget',
						widgetType: 'button',
						settings: {
							text: 'You can copy me',
							background_color: '#000000',
						},
					},
					element: eCol,
					returnValue: true,
				} );

				// Delete button 1.
				$e.run( 'document/elements/delete', {
					element: eButton1,
				} );

				// Validate.
				assert.equal( eCol.collection.length, 1 );

				// Delete button 2.
				$e.run( 'document/elements/delete', {
					element: eButton2,
				} );

				// Validate.
				assert.equal( eCol.collection.length, 0 );
			} );
		} );

		QUnit.module( 'Multiple Selection', () => {
			QUnit.test( 'Multiple Settings', ( assert ) => {
				// Create section 1.
				const eSection1 = $e.run( 'document/elements/createSection', {
					columns: 1,
					returnValue: true,
				} );

				// Create section 2.
				const eSection2 = $e.run( 'document/elements/createSection', {
					columns: 1,
					returnValue: true,
				} );

				// Create column for each section.
				const eCols = $e.run( 'document/elements/create', {
					model: {
						elType: 'column',
					},
					elements: [ eSection1, eSection2 ],
					returnValue: true,
				} );

				// Create button for each column.
				const eButtons = $e.run( 'document/elements/create', {
					model: {
						elType: 'widget',
						widgetType: 'button',
						settings: {
							text: 'You can copy me',
							background_color: '#000000',
						},
					},
					elements: eCols,
					returnValue: true,
				} );

				// Change button text for each button.
				$e.run( 'document/elements/settings', {
					elements: eButtons,
					settings: {
						text: 'i test it',
					},
				} );

				// Check button text.
				eButtons.forEach( ( eButton ) => {
					assert.equal( eButton.model.attributes.settings.attributes.text, 'i test it' );
				} );
			} );

			QUnit.test( 'Create Multiple Columns', ( assert ) => {
				// Create section 1.
				const eSection1 = $e.run( 'document/elements/createSection', {
					columns: 1,
					returnValue: true,
				} );

				// Create section 2.
				const eSection2 = $e.run( 'document/elements/createSection', {
					columns: 1,
					returnValue: true,
				} );

				// Create column.
				const eCols = $e.run( 'document/elements/create', {
					model: {
						elType: 'column',
					},
					elements: [ eSection1, eSection2 ],
					returnValue: true,
				} );

				// Check columns exist.
				eCols.forEach( ( eCol ) => {
					assert.equal( elementor.getPreviewView().children.some( ( a ) => {
						return a.children.findByModel( eCol.model );
					} ), true );
				} );
			} );

			QUnit.test( 'Create Multiple Widgets', ( assert ) => {
				// Create section.
				const eSection = $e.run( 'document/elements/createSection', {
					returnValue: true,
				} );

				// Create column 1.
				const eCol1 = $e.run( 'document/elements/create', {
					model: {
						elType: 'column',
					},
					element: eSection,
					returnValue: true,
				} );

				// Create column 2.
				const eCol2 = $e.run( 'document/elements/create', {
					model: {
						elType: 'column',
					},
					element: eSection,
					returnValue: true,
				} );

				// Create Buttons.
				const eButtons = $e.run( 'document/elements/create', {
					model: {
						elType: 'widget',
						widgetType: 'button',
						settings: {
							text: 'hey',
						},
					},
					elements: [ eCol1, eCol2 ],
					returnValue: true,
				} );

				// Check button exist.
				assert.equal( Boolean( eCol1.children.findByModel( eButtons[ 0 ].model ) ), true );
				assert.equal( Boolean( eCol2.children.findByModel( eButtons[ 1 ].model ) ), true );
			} );

			QUnit.test( 'Multiple Duplicate', ( assert ) => {
				// Create section.
				const eSection = $e.run( 'document/elements/createSection', {
					returnValue: true,
				} );

				// Create column 1.
				const eCol1 = $e.run( 'document/elements/create', {
					model: {
						elType: 'column',
					},
					element: eSection,
					returnValue: true,
				} );

				// Create column 2.
				const eCol2 = $e.run( 'document/elements/create', {
					model: {
						elType: 'column',
					},
					element: eSection,
					returnValue: true,
				} );

				// Create button.
				const eButtons = $e.run( 'document/elements/create', {
					model: {
						elType: 'widget',
						widgetType: 'button',
						settings: {
							text: 'hey',
						},
					},
					elements: [ eCol1, eCol2 ],
					returnValue: true,
				} );

				// Duplicate button.
				$e.run( 'document/elements/duplicate', {
					elements: eButtons,
				} );

				// Check duplicated button exist.
				assert.equal( eCol1.children.length, 2 );
				assert.equal( eCol2.children.length, 2 );
			} );

			QUnit.test( 'Multiple Copy & Paste', ( assert ) => {
				// Create section 1.
				const eSection1 = $e.run( 'document/elements/createSection', {
					returnValue: true,
				} );

				// Create section 2.
				const eSection2 = $e.run( 'document/elements/createSection', {
					returnValue: true,
				} );

				// Create columns.
				const eCols = $e.run( 'document/elements/create', {
					model: {
						elType: 'column',
					},
					elements: [ eSection1, eSection2 ],
					returnValue: true,
				} );

				// Create buttons.
				const eButtons = $e.run( 'document/elements/create', {
					model: {
						elType: 'widget',
						widgetType: 'button',
						settings: {
							text: 'hey',
						},
					},
					elements: eCols,
					returnValue: true,
				} );

				// Copy buttons.
				$e.run( 'document/elements/copy', {
					element: eButtons[ 0 ],
				} );

				// Paste button
				$e.run( 'document/elements/paste', {
					elements: eCols,
				} );

				// Check pasted button exist.
				eCols.forEach( ( eCol ) => {
					assert.equal( eCol.children.length, 2 );
				} );
			} );

			QUnit.test( 'Multiple Paste Style', ( assert ) => {
				// Create section.
				const eSection = $e.run( 'document/elements/createSection', {
					returnValue: true,
				} );

				// Create column.
				const eCol = $e.run( 'document/elements/create', {
					model: {
						elType: 'column',
					},
					element: eSection,
					returnValue: true,
				} );

				// Create button 1.
				const eButtonSimple1 = $e.run( 'document/elements/create', {
					model: {
						elType: 'widget',
						widgetType: 'button',
						settings: {
							text: 'hey',
						},
					},
					element: eCol,
					returnValue: true,
				} );

				// Create button 2.
				const eButtonSimple2 = $e.run( 'document/elements/create', {
					model: {
						elType: 'widget',
						widgetType: 'button',
						settings: {
							text: 'hey',
						},
					},
					element: eCol,
					returnValue: true,
				} );

				// Create button with style.
				const eButtonStyled = $e.run( 'document/elements/create', {
					model: {
						elType: 'widget',
						widgetType: 'button',
						settings: {
							text: 'You can copy me',
							background_color: '#000000',
						},
					},
					element: eCol,
					returnValue: true,
				} );

				// Copy styled button.
				$e.run( 'document/elements/copy', {
					element: eButtonStyled,
				} );

				// Paste style to simple button.
				$e.run( 'document/elements/pasteStyle', {
					elements: [ eButtonSimple1, eButtonSimple2 ],
				} );

				// Check pasted style exist.
				assert.equal( eButtonSimple1.model.attributes.settings.attributes.background_color, '#000000' );
				assert.equal( eButtonSimple2.model.attributes.settings.attributes.background_color, '#000000' );
			} );

			QUnit.test( 'Multiple Reset Style', ( assert ) => {
				// Create section.
				const eSection = $e.run( 'document/elements/createSection', {
					returnValue: true,
				} );

				// Create column.
				const eCol = $e.run( 'document/elements/create', {
					model: {
						elType: 'column',
					},
					element: eSection,
					returnValue: true,
				} );

				// Create button 1 with style.
				const eButtonStyled1 = $e.run( 'document/elements/create', {
					model: {
						elType: 'widget',
						widgetType: 'button',
						settings: {
							text: 'You can copy me',
							background_color: '#000000',
						},
					},
					element: eCol,
					returnValue: true,
				} );

				const eButtonStyled2 = $e.run( 'document/elements/create', {
					model: {
						elType: 'widget',
						widgetType: 'button',
						settings: {
							text: 'You can copy me',
							background_color: '#000000',
						},
					},
					element: eCol,
					returnValue: true,
				} );

				// Paste style to simple button.
				$e.run( 'document/elements/resetStyle', {
					elements: [ eButtonStyled1, eButtonStyled2 ],
				} );

				// Check pasted style exist.
				assert.equal( eButtonStyled1.model.attributes.settings.attributes.background_color, '' );
				assert.equal( eButtonStyled2.model.attributes.settings.attributes.background_color, '' );
			} );

			QUnit.test( 'Multiple Move', ( assert ) => {
				// Create section.
				const eSection = $e.run( 'document/elements/createSection', {
					returnValue: true,
				} );

				// Create column 1.
				const eCol1 = $e.run( 'document/elements/create', {
					model: {
						elType: 'column',
					},
					element: eSection,
					returnValue: true,
				} );

				// Create column 2.
				const eCol2 = $e.run( 'document/elements/create', {
					model: {
						elType: 'column',
					},
					element: eSection,
					returnValue: true,
				} );

				// Create button 1 at column1.
				const eButton1 = $e.run( 'document/elements/create', {
					model: {
						elType: 'widget',
						widgetType: 'button',
						settings: {
							text: 'You can copy me',
							background_color: '#000000',
						},
					},
					element: eCol1,
					returnValue: true,
				} );

				// Create button2 at column1.
				const eButton2 = $e.run( 'document/elements/create', {
					model: {
						elType: 'widget',
						widgetType: 'button',
						settings: {
							text: 'You can copy me',
							background_color: '#000000',
						},
					},
					element: eCol1,
					returnValue: true,
				} );

				// Move button to eCol2.
				$e.run( 'document/elements/move', {
					elements: [ eButton1, eButton2 ],
					target: eCol2,
				} );

				// Validate.
				assert.equal( eCol1.collection.length, 0 );
				assert.equal( eCol2.collection.length, 2 );
			} );

			QUnit.test( 'Multiple Delete', ( assert ) => {
				// Create section.
				const eSection = $e.run( 'document/elements/createSection', {
					returnValue: true,
				} );

				// Create column.
				const eCol = $e.run( 'document/elements/create', {
					model: {
						elType: 'column',
					},
					element: eSection,
					returnValue: true,
				} );

				// Create button 1.
				const eButton1 = $e.run( 'document/elements/create', {
					model: {
						elType: 'widget',
						widgetType: 'button',
						settings: {
							text: 'You can copy me',
							background_color: '#000000',
						},
					},
					element: eCol,
					returnValue: true,
				} );

				// Create button 2.
				const eButton2 = $e.run( 'document/elements/create', {
					model: {
						elType: 'widget',
						widgetType: 'button',
						settings: {
							text: 'You can copy me',
							background_color: '#000000',
						},
					},
					element: eCol,
					returnValue: true,
				} );

				// Delete buttons.
				$e.run( 'document/elements/delete', {
					elements: [ eButton1, eButton2 ],
				} );

				// Validate.
				assert.equal( eCol.collection.length, 0 );
			} );
		} );
	} );
} );
