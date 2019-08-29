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
				assert.equal( elementor.getPreviewView().collection.length, 0 );
			} );

			QUnit.test( 'Copy All', ( assert ) => {
				const eSection = Elements.createSection( 1 );

				const eColumn = Elements.createColumn( eSection );

				Elements.createButton( eColumn );
				Elements.createButton( eColumn );

				Elements.copyAll();

				Elements.paste( elementor.getPreviewView(), true );

				assert.equal( eSection.collection.length, 2 );
			} );

			QUnit.test( 'Create Section', ( assert ) => {
				const eSection = Elements.createSection( 1 );

				// Check section exist.
				assert.equal( Boolean( elementor.getPreviewView().children.findByModel( eSection.model ) ), true );
			} );

			QUnit.test( 'Create Column', ( assert ) => {
				const eColumn = Elements.createSection( 1, true );

				// Check column exist.
				assert.equal( elementor.getPreviewView().children.some( ( a ) => {
					return a.children.findByModel( eColumn.model );
				} ), true );
			} );

			QUnit.test( 'Create Widget', ( assert ) => {
				const eColumn = Elements.createSection( 1, true );
				const eButton = Elements.createButton( eColumn );
				// Check button exist.
				assert.equal( Boolean( eColumn.children.findByModel( eButton.model ) ), true );
			} );

			QUnit.test( 'Create Widget: Inner Section', ( assert ) => {
				const eColumn = Elements.createSection( 1, true );
				const eInnerSection = Elements.createInnerSection( eColumn );

				// Check inner section exist.
				assert.equal( Boolean( eColumn.children.findByModel( eInnerSection.model ) ), true );

				// Check inner section have two columns.
				assert.equal( eInnerSection.collection.length, 2 );
			} );

			QUnit.test( 'Duplicate', ( assert ) => {
				const eColumn = Elements.createSection( 1, true );
				const eButton = Elements.createButton( eColumn );

				Elements.duplicate( eButton );

				// TODO: Test if duplicate item have unique ids.

				// Check duplicated button exist.
				assert.equal( eColumn.children.length, 2 );
			} );

			QUnit.test( 'Copy & Paste', ( assert ) => {
				const eColumn = Elements.createSection( 1, true );
				const eButton = Elements.createButton( eColumn );

				Elements.copy( eButton );
				Elements.paste( eColumn );

				// Check pasted button exist.
				assert.equal( eColumn.children.length, 2 );
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
				const eButtonSimple = Elements.createMockButtonWidget();
				const eButtonStyled = Elements.createMockButtonStyled();

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

				Elements.move( eSection, elementor.getPreviewView(), { at: 0 } );

				// Validate first section have 3 columns.
				assert.equal( elementor.getPreviewView().model.attributes.elements.first().attributes.elements.length, 3 );
			} );

			QUnit.test( 'Move Column', ( assert ) => {
				const eSection1 = Elements.createSection();
				const eSection2 = Elements.createSection();

				const eColumn = Elements.createColumn( eSection1 );

				Elements.move( eColumn, eSection2 );

				// Validate.
				assert.equal( eSection2.collection.length, 2 );
			} );

			QUnit.test( 'Move Widget', ( assert ) => {
				const eSection = Elements.createSection();

				const eColumn1 = Elements.createColumn( eSection );
				const eColumn2 = Elements.createColumn( eSection );

				const eButton = Elements.createButton( eColumn1 );

				Elements.move( eButton, eColumn2 );

				// Validate.
				assert.equal( eColumn1.collection.length, 0 );
				assert.equal( eColumn2.collection.length, 1 );
			} );

			QUnit.test( 'Delete', ( assert ) => {
				// Create column.
				const eColumn = Elements.createSection( 1, true );

				const eButton1 = Elements.createButton( eColumn );
				const eButton2 = Elements.createButton( eColumn );

				Elements.delete( eButton1 );

				// Validate.
				assert.equal( eColumn.collection.length, 1 );

				Elements.delete( eButton2 );

				// Validate.
				assert.equal( eColumn.collection.length, 0 );
			} );
		} );

		QUnit.module( 'Multiple Selection', () => {
			QUnit.test( 'Multiple Settings', ( assert ) => {
				const eSection1 = Elements.createSection();
				const eSection2 = Elements.createSection();

				const eColumns = Elements.createMultiColumn( [ eSection1, eSection2 ] );

				const eButtons = Elements.createMultiButton( eColumns );

				Elements.multiSettings( eButtons, { text: 'i test it' } );

				// Check button text.
				eButtons.forEach( ( eButton ) => {
					assert.equal( eButton.model.attributes.settings.attributes.text, 'i test it' );
				} );
			} );

			QUnit.test( 'Create Multiple Columns', ( assert ) => {
				const eSection1 = Elements.createSection();
				const eSection2 = Elements.createSection();

				const eColumns = Elements.createMultiColumn( [ eSection1, eSection2 ] );

				// Check columns exist.
				eColumns.forEach( ( eColumn ) => {
					assert.equal( elementor.getPreviewView().children.some( ( a ) => {
						return a.children.findByModel( eColumn.model );
					} ), true );
				} );
			} );

			QUnit.test( 'Create Multiple Widgets', ( assert ) => {
				const eColumn1 = Elements.createSection( 1, true );
				const eColumn2 = Elements.createSection( 1, true );

				const eButtons = Elements.createMultiButton( [ eColumn1, eColumn2 ] );

				// Check button exist.
				assert.equal( Boolean( eColumn1.children.findByModel( eButtons[ 0 ].model ) ), true );
				assert.equal( Boolean( eColumn2.children.findByModel( eButtons[ 1 ].model ) ), true );
			} );

			QUnit.test( 'Multiple Duplicate', ( assert ) => {
				const eColumn1 = Elements.createSection( 1, true );
				const eColumn2 = Elements.createSection( 1, true );

				const eButtons = Elements.createMultiButton( [ eColumn1, eColumn2 ] );

				Elements.multiDuplicate( eButtons );

				// Check duplicated button exist.
				assert.equal( eColumn1.children.length, 2 );
				assert.equal( eColumn2.children.length, 2 );
			} );

			QUnit.test( 'Multiple Copy & Paste', ( assert ) => {
				const eSection1 = Elements.createSection();
				const eSection2 = Elements.createSection();

				const eColumns = Elements.createMultiColumn( [ eSection1, eSection2 ] );

				const eButtons = Elements.createMultiButton( eColumns );

				Elements.copy( eButtons[ 0 ] );

				Elements.multiPaste( eColumns );

				// Check pasted button exist.
				eColumns.forEach( ( eColumn ) => {
					assert.equal( eColumn.children.length, 2 );
				} );
			} );

			QUnit.test( 'Multiple Paste Style', ( assert ) => {
				const eButtonSimple1 = Elements.createMockButtonWidget();
				const eButtonSimple2 = Elements.createMockButtonWidget();

				const eButtonStyled = Elements.createMockButtonStyled();

				Elements.copy( eButtonStyled );

				Elements.multiPasteStyle( [ eButtonSimple1, eButtonSimple2 ] );

				// Check pasted style exist.
				assert.equal( eButtonSimple1.model.attributes.settings.attributes.background_color, '#000000' );
				assert.equal( eButtonSimple2.model.attributes.settings.attributes.background_color, '#000000' );
			} );

			QUnit.test( 'Multiple Reset Style', ( assert ) => {
				const eButtonStyled1 = Elements.createMockButtonStyled();
				const eButtonStyled2 = Elements.createMockButtonStyled();

				Elements.multiResetStyle( [ eButtonStyled1, eButtonStyled2 ] );

				// Check pasted style exist.
				assert.equal( eButtonStyled1.model.attributes.settings.attributes.background_color, '' );
				assert.equal( eButtonStyled2.model.attributes.settings.attributes.background_color, '' );
			} );

			QUnit.test( 'Multiple Move', ( assert ) => {
				const eSection = Elements.createSection();

				const eColumn1 = Elements.createColumn( eSection );
				const eColumn2 = Elements.createColumn( eSection );

				const eButton1 = Elements.createButton( eColumn1 );
				const eButton2 = Elements.createButton( eColumn1 );

				// Move button to eCol2.
				Elements.multiMove( [ eButton1, eButton2 ], eColumn2 );

				// Validate.
				assert.equal( eColumn1.collection.length, 0 );
				assert.equal( eColumn2.collection.length, 2 );
			} );

			QUnit.test( 'Multiple Delete', ( assert ) => {
				const eColumn = Elements.createSection( 1 , true );

				const eButton1 = Elements.createButton( eColumn );
				const eButton2 = Elements.createButton( eColumn );

				Elements.multiDelete( [ eButton1, eButton2 ] );

				// Validate.
				assert.equal( eColumn.collection.length, 0 );
			} );
		} );
	} );
} );
