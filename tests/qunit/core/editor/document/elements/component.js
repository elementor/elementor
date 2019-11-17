/**
 * TODO: everywhere possible dont use created container
 * to check command propriety, but use: 'elementor.getPreviewContainer'
 */

import DocumentHelper from '../helper';
import * as Commands from './commands';

jQuery( () => {
	QUnit.module( 'Component: document/elements', ( hooks ) => {
		hooks.beforeEach( () => {
			DocumentHelper.empty();
		} );

		DocumentHelper.testCommands( Commands );

		QUnit.module( 'Single Selection', () => {
			QUnit.test( 'ResizeColumn', ( assert ) => {
				assert.equal( 1, 1, 'Test was skipped.' );
				/*
				const newSize = 20,
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
						`Column2 size was changed to '${ column2NewSize }'.` );
					*/
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
			QUnit.test( 'Duplicate', ( assert ) => {
				const eColumn1 = DocumentHelper.createSection( 1, true ),
					eColumn2 = DocumentHelper.createSection( 1, true ),
					eButtons = DocumentHelper.multiCreateButton( [ eColumn1, eColumn2 ] );

				DocumentHelper.multiDuplicate( eButtons );

				// Check duplicated button exist.
				assert.equal( eColumn1.view.children.length, 2, 'Two buttons were created.' );
				assert.equal( eColumn2.view.children.length, 2, 'Two buttons were duplicated.' );
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
