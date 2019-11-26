import DocumentHelper from '../../helper';

export const Move = () => {
	QUnit.module( 'Move', () => {
		QUnit.module( 'Single Selection', () => {
			QUnit.test( 'Section', ( assert ) => {
				// Create Section at 0.
				DocumentHelper.createSection();

				const eSection = DocumentHelper.createSection( 3 );

				DocumentHelper.move( eSection, elementor.getPreviewContainer(), { at: 0 } );

				// Validate first section have 3 columns.
				assert.equal( elementor.getPreviewContainer().children.first().attributes.elements.length, 3, 3,
					'Section were moved.' );
			} );

			QUnit.test( 'Column', ( assert ) => {
				const eSection1 = DocumentHelper.createSection(),
					eSection2 = DocumentHelper.createSection(),
					eColumn = DocumentHelper.createColumn( eSection1 );

				DocumentHelper.move( eColumn, eSection2 );

				// Validate.
				assert.equal( eSection2.view.collection.length, 2,
					'Columns were moved.' );
			} );

			QUnit.test( 'Widget', ( assert ) => {
				const eSection = DocumentHelper.createSection(),
					eColumn1 = DocumentHelper.createColumn( eSection ),
					eColumn2 = DocumentHelper.createColumn( eSection ),
					eButton = DocumentHelper.createButton( eColumn1 );

				DocumentHelper.move( eButton, eColumn2 );

				// Validate.
				assert.equal( eColumn1.view.collection.length, 0,
					'Widget were removed from first column.' );
				assert.equal( eColumn2.view.collection.length, 1,
					'Widget were moved/created at the second column.' );
			} );
		} );

		QUnit.module( 'Multiple Selection', () => {
			QUnit.test( 'Sections', ( assert ) => {
				// Create Section at 0.
				DocumentHelper.createSection();

				const section1ColumnsCount = 3,
					section2ColumnsCount = 4,
					eSection1 = DocumentHelper.createSection( section1ColumnsCount ),
					eSection2 = DocumentHelper.createSection( section2ColumnsCount );

				DocumentHelper.multiMove( [ eSection1, eSection2 ], elementor.getPreviewContainer(), { at: 0 } );

				// Validate first section have 3 columns.
				assert.equal( elementor.getPreviewContainer().model.attributes.elements.first().attributes.elements.length,
					section1ColumnsCount,
					`Section #1, '${ section1ColumnsCount }' columns were created.` );

				// Validate second section have 4 columns.
				assert.equal( elementor.getPreviewContainer().model.attributes.elements.at( 1 ).attributes.elements.length,
					section2ColumnsCount,
					`Section #2, '${ section2ColumnsCount }' columns were created.` );
			} );

			QUnit.test( 'Columns', ( assert ) => {
				const eSection1 = DocumentHelper.createSection(),
					eSection2 = DocumentHelper.createSection(),
					eColumn1 = DocumentHelper.createColumn( eSection1 ),
					eColumn2 = DocumentHelper.createColumn( eSection1 );

				DocumentHelper.multiMove( [ eColumn1, eColumn2 ], eSection2 );

				// Validate.
				assert.equal( eSection2.view.collection.length, 3,
					'Columns were moved.' );
			} );

			QUnit.test( 'Widgets', ( assert ) => {
				const eSection = DocumentHelper.createSection(),
					eColumn1 = DocumentHelper.createColumn( eSection ),
					eColumn2 = DocumentHelper.createColumn( eSection ),
					eButton1 = DocumentHelper.createButton( eColumn1 ),
					eButton2 = DocumentHelper.createButton( eColumn1 );

				DocumentHelper.multiMove( [ eButton1, eButton2 ], eColumn2 );

				// Validate.
				assert.equal( eColumn1.view.collection.length, 0,
					'Widgets were removed from the first column.' );
				assert.equal( eColumn2.view.collection.length, 2,
					'Widgets were moved/create at the second column.' );
			} );
		} );
	} );
};

export default Move;
