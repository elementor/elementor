/**
 * TODO: everywhere possible dont use created container
 * to check command propriety, but use: 'elementor.getPreviewContainer'
 */

import DocumentHelper from '../helper';
import * as Commands from './commands/index.spec.js';

jQuery( () => {
	QUnit.module( 'Component: document/elements', ( hooks ) => {
		hooks.beforeEach( () => {
			DocumentHelper.empty();
		} );

		DocumentHelper.testCommands( Commands );

		QUnit.module( 'Single Selection', () => {
			// QUnit.test( 'ResizeColumn', ( assert ) => {
			// 	//assert.equal( 1, 1, 'Test was skipped.' );
			//
			// 	const newSize = 20,
			// 			eSection = DocumentHelper.createSection( 2 ),
			// 			eColumn1 = eSection.view.children.findByIndex( 0 ).getContainer(),
			// 			eColumn2 = eSection.view.children.findByIndex( 1 ).getContainer(),
			// 			column2NewSize = 100 - newSize;
			//
			// 		const doneSettings = assert.async();
			//
			// 		// Manual specific `_inline_size` since tests does not have real ui.
			// 		$e.run( 'document/elements/settings', {
			// 			containers: [ eColumn1, eColumn2 ],
			// 			settings: {
			// 				[ eColumn1.id ]: { _inline_size: 50 },
			// 				[ eColumn2.id ]: { _inline_size: 50 },
			// 			},
			// 			isMultiSettings: true,
			// 		} );
			//
			// 		setTimeout( () => doneSettings() );
			//
			// 		DocumentHelper.resizeColumn( eColumn1, newSize );
			//
			// 		const doneResize = assert.async();
			//
			// 		setTimeout( () => {
			// 			// Check values.
			// 			assert.equal( eColumn1.settings.attributes._inline_size, newSize,
			// 				`Column1 size was changed to '${ newSize }'.` );
			// 			assert.equal( eColumn2.settings.attributes._inline_size, ( column2NewSize ),
			// 				`Column2 size was changed to '${ column2NewSize }'.` );
			//
			// 			doneResize();
			// 		} );
			// } );

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
		} );

		QUnit.module( 'Multiple Selection', () => {
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
		} );
	} );
} );
