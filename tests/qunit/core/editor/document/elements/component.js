import Elements from '../helpers/elements';

jQuery( () => {
	QUnit.module( 'Component: document/elements', () => {
		QUnit.module( 'Single Selection', () => {
			QUnit.test( 'Empty', ( assert ) => {
				const eColumn = Elements.createSection( 1, true );

				Elements.createButton( eColumn );
				Elements.createButton( eColumn );

				Elements.empty();

				// Check.
				assert.equal( elementor.getPreviewContainer().view.collection.length, 0 );
			} );

			QUnit.test( 'Copy All', ( assert ) => {
				const eSection = Elements.createSection( 1 ),
					eColumn = Elements.createColumn( eSection );

				Elements.createButton( eColumn );
				Elements.createButton( eColumn );

				Elements.copyAll();

				Elements.paste( elementor.getPreviewContainer(), true );

				assert.equal( eSection.view.collection.length, 2 );
			} );

			QUnit.test( 'Create Section', ( assert ) => {
				const eSection = Elements.createSection( 1 );

				// Check section exist.
				assert.equal( Boolean( elementor.getPreviewContainer().view.children.findByModel( eSection.model ) ), true );
			} );

			QUnit.test( 'Create Column', ( assert ) => {
				const eColumn = Elements.createSection( 1, true );

				// Check column exist.
				assert.equal( elementor.getPreviewContainer().view.children.some( ( a ) => {
					return a.children.findByModel( eColumn.model );
				} ), true );
			} );

			QUnit.test( 'Create Widget', ( assert ) => {
				const eColumn = Elements.createSection( 1, true ),
					eButton = Elements.createButton( eColumn );

				// Check button exist.
				assert.equal( Boolean( eColumn.view.children.findByModel( eButton.model ) ), true );
			} );

			QUnit.test( 'Create Widget: Inner Section', ( assert ) => {
				const eColumn = Elements.createSection( 1, true ),
					eInnerSection = Elements.createInnerSection( eColumn );

				assert.equal( Boolean( eColumn.view.children.findByModel( eInnerSection.model ) ), true, 'Check inner section exist' );

				console.log( eInnerSection.view );
				assert.equal( eInnerSection.view.collection.length, 2, 'Check inner section have two columns' ); // TODO: get default inner section columns.
			} );

			QUnit.test( 'Duplicate', ( assert ) => {
				const eColumn = Elements.createSection( 1, true ),
					eButton = Elements.createButton( eColumn );

				Elements.duplicate( eButton );

				// TODO: Test if duplicate item have unique ids.

				// Check duplicated button exist.
				assert.equal( eColumn.view.children.length, 2 );
			} );

			QUnit.test( 'Copy & Paste', ( assert ) => {
				const eColumn = Elements.createSection( 1, true ),
					eButton = Elements.createButton( eColumn );

				Elements.copy( eButton );
				Elements.paste( eColumn );

				// Check pasted button exist.
				assert.equal( eColumn.view.children.length, 2 );
			} );

			QUnit.test( 'Settings', ( assert ) => {
				const eButton = Elements.createMockButtonWidget();

				// Change button text.
				Elements.settings( eButton, {
					text: 'i test it',
				} );

				// Check button text.
				assert.equal( eButton.model.attributes.settings.attributes.text, 'i test it' );
			} );

			QUnit.test( 'Paste Style', ( assert ) => {
				const eButtonSimple = Elements.createMockButtonWidget(),
					eButtonStyled = Elements.createMockButtonStyled();

				Elements.copy( eButtonStyled );
				Elements.pasteStyle( eButtonSimple );

				// Check pasted style exist.
				assert.equal( eButtonSimple.model.attributes.settings.attributes.background_color, '#000000' );
			} );

			QUnit.test( 'Reset Style', ( assert ) => {
				const eButtonStyled = Elements.createMockButtonStyled();

				Elements.resetStyle( eButtonStyled );

				// Check pasted style exist.
				assert.equal( eButtonStyled.model.attributes.settings.attributes.background_color, '' );
			} );

			QUnit.test( 'Move Section', ( assert ) => {
				// Create Section at 0.
				Elements.createSection();

				const eSection = Elements.createSection( 3 );

				Elements.move( eSection, elementor.getPreviewContainer(), { at: 0 } );

				// Validate first section have 3 columns.
				assert.equal( elementor.getPreviewContainer().model.attributes.elements.first().attributes.elements.length, 3 );
			} );

			QUnit.test( 'Move Column', ( assert ) => {
				const eSection1 = Elements.createSection(),
					eSection2 = Elements.createSection(),
					eColumn = Elements.createColumn( eSection1 );

				Elements.move( eColumn, eSection2 );

				// Validate.
				assert.equal( eSection2.view.collection.length, 2 );
			} );

			QUnit.test( 'Move Widget', ( assert ) => {
				const eSection = Elements.createSection(),
					eColumn1 = Elements.createColumn( eSection ),
					eColumn2 = Elements.createColumn( eSection ),
					eButton = Elements.createButton( eColumn1 );

				Elements.move( eButton, eColumn2 );

				// Validate.
				assert.equal( eColumn1.view.collection.length, 0 );
				assert.equal( eColumn2.view.collection.length, 1 );
			} );

			QUnit.test( 'Delete', ( assert ) => {
				const eColumn = Elements.createSection( 1, true ),
					eButton1 = Elements.createButton( eColumn ),
					eButton2 = Elements.createButton( eColumn );

				Elements.delete( eButton1 );

				// Validate.
				assert.equal( eColumn.view.collection.length, 1 );

				Elements.delete( eButton2 );

				// Validate.
				assert.equal( eColumn.view.collection.length, 0 );
			} );
		} );

		QUnit.module( 'Multiple Selection', () => {
			QUnit.test( 'Create Columns', ( assert ) => {
				const eSection1 = Elements.createSection(),
					eSection2 = Elements.createSection(),
					eColumns = Elements.multiCreateColumn( [ eSection1, eSection2 ] );

				// Check columns exist.
				eColumns.forEach( ( eColumn ) => {
					assert.equal( elementor.getPreviewContainer().view.children.some( ( a ) => {
						return a.children.findByModel( eColumn.model );
					} ), true );
				} );
			} );

			QUnit.test( 'Create Widgets', ( assert ) => {
				const eColumn1 = Elements.createSection( 1, true ),
					eColumn2 = Elements.createSection( 1, true ),
					eButtons = Elements.multiCreateButton( [ eColumn1, eColumn2 ] );

				// Check button exist.
				assert.equal( Boolean( eColumn1.view.children.findByModel( eButtons[ 0 ].model ) ), true );
				assert.equal( Boolean( eColumn2.view.children.findByModel( eButtons[ 1 ].model ) ), true );
			} );

			QUnit.test( 'Duplicate', ( assert ) => {
				const eColumn1 = Elements.createSection( 1, true ),
					eColumn2 = Elements.createSection( 1, true ),
					eButtons = Elements.multiCreateButton( [ eColumn1, eColumn2 ] );

				Elements.multiDuplicate( eButtons );

				// Check duplicated button exist.
				assert.equal( eColumn1.view.children.length, 2 );
				assert.equal( eColumn2.view.children.length, 2 );
			} );

			QUnit.test( 'Settings', ( assert ) => {
				const eSection1 = Elements.createSection(),
					eSection2 = Elements.createSection(),
					eColumns = Elements.multiCreateColumn( [ eSection1, eSection2 ] ),
					eButtons = Elements.multiCreateButton( eColumns );

				Elements.multiSettings( eButtons, { text: 'i test it' } );

				// Check button text.
				eButtons.forEach( ( eButton ) => {
					assert.equal( eButton.model.attributes.settings.attributes.text, 'i test it' );
				} );
			} );

			QUnit.test( 'Copy & Paste', ( assert ) => {
				const eSection1 = Elements.createSection(),
					eSection2 = Elements.createSection(),
					eColumns = Elements.multiCreateColumn( [ eSection1, eSection2 ] ),
					eButtons = Elements.multiCreateButton( eColumns );

				Elements.copy( eButtons[ 0 ] );

				Elements.multiPaste( eColumns );

				// Check pasted button exist.
				eColumns.forEach( ( eColumn ) => {
					assert.equal( eColumn.view.children.length, 2 );
				} );
			} );

			QUnit.test( 'Paste Style', ( assert ) => {
				const eButtonSimple1 = Elements.createMockButtonWidget(),
					eButtonSimple2 = Elements.createMockButtonWidget(),
					eButtonStyled = Elements.createMockButtonStyled();

				Elements.copy( eButtonStyled );

				Elements.multiPasteStyle( [ eButtonSimple1, eButtonSimple2 ] );

				// Check pasted style exist.
				assert.equal( eButtonSimple1.model.attributes.settings.attributes.background_color, '#000000' );
				assert.equal( eButtonSimple2.model.attributes.settings.attributes.background_color, '#000000' );
			} );

			QUnit.test( 'Reset Style', ( assert ) => {
				const eButtonStyled1 = Elements.createMockButtonStyled(),
					eButtonStyled2 = Elements.createMockButtonStyled();

				Elements.multiResetStyle( [ eButtonStyled1, eButtonStyled2 ] );

				// Check pasted style exist.
				assert.equal( eButtonStyled1.model.attributes.settings.attributes.background_color, '' );
				assert.equal( eButtonStyled2.model.attributes.settings.attributes.background_color, '' );
			} );

			QUnit.test( 'Move Sections', ( assert ) => {
				// Create Section at 0.
				Elements.createSection();

				const eSection1 = Elements.createSection( 3 ),
					eSection2 = Elements.createSection( 4 );

				Elements.multiMove( [ eSection1, eSection2 ], elementor.getPreviewContainer(), { at: 0 } );

				// Validate first section have 3 columns.
				assert.equal( elementor.getPreviewContainer().model.attributes.elements.first().attributes.elements.length, 3 );

				// Validate second section have 4 columns.
				assert.equal( elementor.getPreviewContainer().model.attributes.elements.at( 1 ).attributes.elements.length, 4 );
			} );

			QUnit.test( 'Move Columns', ( assert ) => {
				const eSection1 = Elements.createSection(),
					eSection2 = Elements.createSection(),
					eColumn1 = Elements.createColumn( eSection1 ),
					eColumn2 = Elements.createColumn( eSection1 );

				Elements.multiMove( [ eColumn1, eColumn2 ], eSection2 );

				// Validate.
				assert.equal( eSection2.view.collection.length, 3 );
			} );

			QUnit.test( 'Move Widgets', ( assert ) => {
				const eSection = Elements.createSection(),
					eColumn1 = Elements.createColumn( eSection ),
					eColumn2 = Elements.createColumn( eSection ),
					eButton1 = Elements.createButton( eColumn1 ),
					eButton2 = Elements.createButton( eColumn1 );

				Elements.multiMove( [ eButton1, eButton2 ], eColumn2 );

				// Validate.
				assert.equal( eColumn1.view.collection.length, 0 );
				assert.equal( eColumn2.view.collection.length, 2 );
			} );

			QUnit.test( 'Delete', ( assert ) => {
				const eColumn = Elements.createSection( 1, true ),
				eButton1 = Elements.createButton( eColumn ),
				eButton2 = Elements.createButton( eColumn );

				Elements.multiDelete( [ eButton1, eButton2 ] );

				// Validate.
				assert.equal( eColumn.view.collection.length, 0 );
			} );
		} );
	} );
} );
