/**
 * TODO: everywhere possible dont use created container
 * to check command propriety, but use: 'elementor.getPreviewContainer'
 */

import DocumentHelper from '../helper';
import * as Commands from './commands';

const testCommands = ( commands ) => {
	// eslint-disable-next-line no-unused-vars
	Object.entries( commands ).forEach( ( [ command, reference ] ) => reference() );
};

jQuery( () => {
	QUnit.module( 'Component: document/elements', ( hooks ) => {
		hooks.beforeEach( () => {
			DocumentHelper.empty();
		} );

		testCommands( Commands );

		QUnit.module( 'Single Selection', () => {
			QUnit.test( 'Create Section', ( assert ) => {
				const eSection = DocumentHelper.createSection( 1 ),
					isSectionCreated = Boolean( elementor.getPreviewContainer().view.children.findByModel( eSection.model ) );

				// Check.
				assert.equal( isSectionCreated, true, 'Section were created.' );
				assert.equal( elementor.saver.isEditorChanged(), true, 'Command applied the saver editor is changed.' );
			} );

			QUnit.test( 'Create Column', ( assert ) => {
				const eColumn = DocumentHelper.createSection( 1, true ),
					isColumnCreated = elementor.getPreviewContainer().view.children.some( ( a ) => {
						return a.children.findByModel( eColumn.model );
					} );

				// Check column exist.
				assert.equal( isColumnCreated, true, 'Column were created.' );
				assert.equal( elementor.saver.isEditorChanged(), true, 'Command applied the saver editor is changed.' );
			} );

			QUnit.test( 'Resize Column', ( assert ) => {
				assert.equal( 1, 1 );
				/*				const newSize = 20,
									eSection = Elements.createSection( 2 ),
									eColumn1 = eSection.view.children.findByIndex( 0 ).getContainer(),
									eColumn2 = eSection.view.children.findByIndex( 1 ).getContainer(),
									column2NewSize = 100 - newSize;

								// Manual specific `_inline_size` since tests does not have real ui.
								$e.run( 'document/elements/settings', {
									containers: [ eColumn1, eColumn2 ],
									settings: {
										[ eColumn1.id ]: { _inline_size: 50 },
										[ eColumn2.id ]: { _inline_size: 50 },
									},
									isMultiSettings: true,
								} );

								Elements.resizeColumn( eColumn1, newSize );

								// Check values.
								assert.equal( eColumn1.settings.attributes._inline_size, newSize,
									`Column1 size was changed to '${ newSize }'.` );
								assert.equal( eColumn2.settings.attributes._inline_size, ( column2NewSize ),
									`Column2 size was changed to '${ column2NewSize }'.` );*/
			} );

			QUnit.test( 'Create Widget', ( assert ) => {
				const eColumn = DocumentHelper.createSection( 1, true ),
					eButton = DocumentHelper.createButton( eColumn ),
					isButtonCreated = Boolean( eColumn.view.children.findByModel( eButton.model ) );

				// Check button exist.
				assert.equal( isButtonCreated, true, 'Button were created.' );
			} );

			QUnit.test( 'Create Widget: Inner Section', ( assert ) => {
				const eSection = DocumentHelper.createSection( 1 ),
					{ defaultInnerSectionColumns } = eSection.view,
					eColumn = eSection.view.children.findByIndex( 0 ).getContainer(),
					eInnerSection = DocumentHelper.createInnerSection( eColumn ),
					isInnerSectionCreated = Boolean( eColumn.view.children.findByModel( eInnerSection.model ) );

				assert.equal( isInnerSectionCreated, true, 'inner section were created.' );
				assert.equal( eInnerSection.view.collection.length, defaultInnerSectionColumns,
					`'${ defaultInnerSectionColumns }' columns were created in the inner section.` );
			} );

			QUnit.test( 'Create Widget: Custom Position', ( assert ) => {
				const eButton = DocumentHelper.createAutoButton();

				DocumentHelper.settings( eButton, {
					_position: 'absolute',
				} );

				assert.equal( eButton.view.$el.hasClass( 'elementor-absolute' ), true, '',
					'Widget have "elementor-absolute" class.' );
			} );

			QUnit.test( 'Duplicate', ( assert ) => {
				const eColumn = DocumentHelper.createSection( 1, true ),
					eButton = DocumentHelper.createButton( eColumn ),
					eButtonDuplicateCount = 2;

				for ( let i = 0; i < eButtonDuplicateCount; ++i ) {
					const eDuplicatedButton = DocumentHelper.duplicate( eButton );

					// Check if duplicated buttons have unique ids.
					assert.notEqual( eDuplicatedButton.id, eButton.id, `Duplicate button # ${ i + 1 } have unique id.` );
				}

				// Check duplicated button exist.
				assert.equal( eColumn.view.children.length, ( eButtonDuplicateCount + 1 ),
					`'${ eButtonDuplicateCount }' buttons were duplicated.` );
			} );

			QUnit.test( 'Copy & Paste', ( assert ) => {
				const eColumn = DocumentHelper.createSection( 1, true ),
					eButton = DocumentHelper.createButton( eColumn );

				DocumentHelper.copy( eButton );

				// Ensure editor saver.
				elementor.saver.setFlagEditorChange( false );

				DocumentHelper.paste( eColumn );

				// Check.
				assert.equal( elementor.elements.at( 0 ).get( 'elements' ).at( 0 ).get( 'elements' ).length, 2,
					'Pasted element were created.' );
				assert.equal( elementor.saver.isEditorChanged(), true,
					'Command applied the saver editor is changed.' );
			} );

			QUnit.test( 'Settings', ( assert ) => {
				const eButton = DocumentHelper.createAutoButton(),
					text = 'i test it';

				// Change button text.
				DocumentHelper.settings( eButton, { text } );

				// Check button text.
				assert.equal( eButton.settings.attributes.text, text, `text setting were changed to: '${ text }'.` );
			} );

			QUnit.test( 'Paste Style', ( assert ) => {
				const eButtonSimple = DocumentHelper.createAutoButton(),
					eButtonStyled = DocumentHelper.createAutoButtonStyled(),
					eStyledButtonBackground = eButtonStyled.settings.attributes.background_color;

				DocumentHelper.copy( eButtonStyled );

				// Ensure editor saver.
				elementor.saver.setFlagEditorChange( false );

				DocumentHelper.pasteStyle( eButtonSimple );

				// Check
				assert.equal( eButtonSimple.settings.attributes.background_color, eStyledButtonBackground,
					`Button background color was changed to '${ eStyledButtonBackground }'.` );
				assert.equal( elementor.saver.isEditorChanged(), true, 'Command applied the saver editor is changed.' );
			} );

			QUnit.test( 'Reset Style', ( assert ) => {
				const eButtonStyled = DocumentHelper.createAutoButtonStyled();

				// Ensure editor saver.
				elementor.saver.setFlagEditorChange( false );

				DocumentHelper.resetStyle( eButtonStyled );

				// Check pasted style exist.
				assert.equal( eButtonStyled.settings.attributes.background_color, '',
					'Button with custom style were (style) restored.' );
				assert.equal( elementor.saver.isEditorChanged(), true, 'Command applied the saver editor is changed.' );
			} );

			QUnit.test( 'Move Section', ( assert ) => {
				// Create Section at 0.
				DocumentHelper.createSection();

				const eSection = DocumentHelper.createSection( 3 );

				DocumentHelper.move( eSection, elementor.getPreviewContainer(), { at: 0 } );

				// Validate first section have 3 columns.
				assert.equal( elementor.getPreviewContainer().children.first().attributes.elements.length, 3, 3,
					'Section were moved.' );
			} );

			QUnit.test( 'Move Column', ( assert ) => {
				const eSection1 = DocumentHelper.createSection(),
					eSection2 = DocumentHelper.createSection(),
					eColumn = DocumentHelper.createColumn( eSection1 );

				DocumentHelper.move( eColumn, eSection2 );

				// Validate.
				assert.equal( eSection2.view.collection.length, 2,
					'Columns were moved.' );
			} );

			QUnit.test( 'Move Widget', ( assert ) => {
				const eSection = DocumentHelper.createSection(),
					eColumn1 = DocumentHelper.createColumn( eSection ),
					eColumn2 = DocumentHelper.createColumn( eSection ),
					eButton = DocumentHelper.createButton( eColumn1 );

				DocumentHelper.move( eButton, eColumn2 );

				// Validate.
				assert.equal( eColumn1.view.collection.length, 0, 'Widget were removed from first column.' );
				assert.equal( eColumn2.view.collection.length, 1, 'Widget were moved/created at the second column.' );
			} );

			QUnit.test( 'Delete', ( assert ) => {
				const eColumn = DocumentHelper.createSection( 1, true ),
					eButton1 = DocumentHelper.createButton( eColumn ),
					eButton2 = DocumentHelper.createButton( eColumn );

				DocumentHelper.delete( eButton1 );

				// Validate.
				assert.equal( eColumn.view.collection.length, 1, 'Button #1 were deleted.' );

				// Ensure editor saver.
				elementor.saver.setFlagEditorChange( false );

				DocumentHelper.delete( eButton2 );

				// Validate.
				assert.equal( eColumn.view.collection.length, 0, 'Button #2 were deleted.' );

				assert.equal( elementor.saver.isEditorChanged(), true, 'Command applied the saver editor is changed.' );
			} );
		} );

		QUnit.module( 'Multiple Selection', () => {
			QUnit.test( 'Create Columns', ( assert ) => {
				const eSection1 = DocumentHelper.createSection(),
					eSection2 = DocumentHelper.createSection(),
					eColumns = DocumentHelper.multiCreateColumn( [ eSection1, eSection2 ] );

				// Check columns exist.
				let count = 1;
				eColumns.forEach( ( eColumn ) => {
					const isColumnCreated = elementor.getPreviewContainer().view.children.some( ( a ) => {
						return a.children.findByModel( eColumn.model );
					} );

					assert.equal( isColumnCreated, true, `Column #${ count } were created.` );
					++count;
				} );
			} );

			QUnit.test( 'Create Widgets', ( assert ) => {
				const eColumn1 = DocumentHelper.createSection( 1, true ),
					eColumn2 = DocumentHelper.createSection( 1, true ),
					eButtons = DocumentHelper.multiCreateButton( [ eColumn1, eColumn2 ] ),
					isButton1Created = Boolean( eColumn1.view.children.findByModel( eButtons[ 0 ].model ) ),
					isButton2Created = Boolean( eColumn2.view.children.findByModel( eButtons[ 1 ].model ) );

				// Check button exist.
				assert.equal( isButton1Created, true, 'Button #1 were created.' );
				assert.equal( isButton2Created, true, 'Button #2 were created.' );
			} );

			QUnit.test( 'Duplicate', ( assert ) => {
				const eColumn1 = DocumentHelper.createSection( 1, true ),
					eColumn2 = DocumentHelper.createSection( 1, true ),
					eButtons = DocumentHelper.multiCreateButton( [ eColumn1, eColumn2 ] );

				DocumentHelper.multiDuplicate( eButtons );

				// Check duplicated button exist.
				assert.equal( eColumn1.view.children.length, 2, 'Two buttons were created.' );
				assert.equal( eColumn2.view.children.length, 2, 'Two buttons were duplicated.' );
			} );

			QUnit.test( 'Settings', ( assert ) => {
				const eSection1 = DocumentHelper.createSection(),
					eSection2 = DocumentHelper.createSection(),
					eColumns = DocumentHelper.multiCreateColumn( [ eSection1, eSection2 ] ),
					eButtons = DocumentHelper.multiCreateButton( eColumns ),
					text = 'i test it';

				DocumentHelper.multiSettings( eButtons, { text } );

				// Check button text.
				let count = 1;
				eButtons.forEach( ( eButton ) => {
					assert.equal( eButton.model.attributes.settings.attributes.text, text,
						`Button #${ count } text was changed to: '${ text }.'` );
					++count;
				} );
			} );

			QUnit.test( 'Copy & Paste', ( assert ) => {
				const eSection1 = DocumentHelper.createSection(),
					eSection2 = DocumentHelper.createSection(),
					eColumns = DocumentHelper.multiCreateColumn( [ eSection1, eSection2 ] ),
					eButtons = DocumentHelper.multiCreateButton( eColumns );

				DocumentHelper.copy( eButtons[ 0 ] );

				DocumentHelper.multiPaste( eColumns );

				// Check pasted button exist.
				let count = 1;
				eColumns.forEach( ( eColumn ) => {
					assert.equal( eColumn.view.children.length, 2,
						`Button #${ count } were pasted.` );
					++count;
				} );
			} );

			QUnit.test( 'Paste Style', ( assert ) => {
				const eButtonSimple1 = DocumentHelper.createAutoButton(),
					eButtonSimple2 = DocumentHelper.createAutoButton(),
					eButtonStyled = DocumentHelper.createAutoButtonStyled(),
					eStyledButtonBackground = eButtonStyled.settings.attributes.background_color;

				DocumentHelper.copy( eButtonStyled );

				DocumentHelper.multiPasteStyle( [ eButtonSimple1, eButtonSimple2 ] );

				// Check pasted style exist.
				assert.equal( eButtonSimple1.model.attributes.settings.attributes.background_color, eStyledButtonBackground,
					`Button #1 background color was changed to '${ eStyledButtonBackground }'.` );
				assert.equal( eButtonSimple2.model.attributes.settings.attributes.background_color, eStyledButtonBackground,
					`Button #2 background color was changed to '${ eStyledButtonBackground }'.` );
			} );

			QUnit.test( 'Reset Style', ( assert ) => {
				const eButtonStyled1 = DocumentHelper.createAutoButtonStyled(),
					eButtonStyled2 = DocumentHelper.createAutoButtonStyled();

				DocumentHelper.multiResetStyle( [ eButtonStyled1, eButtonStyled2 ] );

				// Check pasted style exist.
				assert.equal( eButtonStyled1.model.attributes.settings.attributes.background_color, '',
					'Button #1 with custom style were (style) restored.' );
				assert.equal( eButtonStyled2.model.attributes.settings.attributes.background_color, '',
					'Button #2 with custom style were (style) restored.' );
			} );

			QUnit.test( 'Move Sections', ( assert ) => {
				// Create Section at 0.
				DocumentHelper.createSection();

				const section1ColumnsCount = 3,
					section2ColumnsCount = 4,
					eSection1 = DocumentHelper.createSection( section1ColumnsCount ),
					eSection2 = DocumentHelper.createSection( section2ColumnsCount );

				DocumentHelper.multiMove( [ eSection1, eSection2 ], elementor.getPreviewContainer(), { at: 0 } );

				// Validate first section have 3 columns.
				assert.equal( elementor.getPreviewContainer().model.attributes.elements.first().attributes.elements.length, section1ColumnsCount,
					`Section #1, '${ section1ColumnsCount }' columns were created.` );

				// Validate second section have 4 columns.
				assert.equal( elementor.getPreviewContainer().model.attributes.elements.at( 1 ).attributes.elements.length, section2ColumnsCount,
					`Section #2, '${ section2ColumnsCount }' columns were created.` );
			} );

			QUnit.test( 'Move Columns', ( assert ) => {
				const eSection1 = DocumentHelper.createSection(),
					eSection2 = DocumentHelper.createSection(),
					eColumn1 = DocumentHelper.createColumn( eSection1 ),
					eColumn2 = DocumentHelper.createColumn( eSection1 );

				DocumentHelper.multiMove( [ eColumn1, eColumn2 ], eSection2 );

				// Validate.
				assert.equal( eSection2.view.collection.length, 3,
					'Columns were moved.' );
			} );

			QUnit.test( 'Move Widgets', ( assert ) => {
				const eSection = DocumentHelper.createSection(),
					eColumn1 = DocumentHelper.createColumn( eSection ),
					eColumn2 = DocumentHelper.createColumn( eSection ),
					eButton1 = DocumentHelper.createButton( eColumn1 ),
					eButton2 = DocumentHelper.createButton( eColumn1 );

				DocumentHelper.multiMove( [ eButton1, eButton2 ], eColumn2 );

				// Validate.
				assert.equal( eColumn1.view.collection.length, 0, 'Widgets were removed from the first column.' );
				assert.equal( eColumn2.view.collection.length, 2, 'Widgets were moved/create at the second column.' );
			} );

			QUnit.test( 'Delete', ( assert ) => {
				const eColumn = DocumentHelper.createSection( 1, true ),
				eButton1 = DocumentHelper.createButton( eColumn ),
				eButton2 = DocumentHelper.createButton( eColumn );

				DocumentHelper.multiDelete( [ eButton1, eButton2 ] );

				// Validate.
				assert.equal( eColumn.view.collection.length, 0, 'Buttons were deleted.' );
			} );
		} );
	} );
} );
