import DocumentHelper from '../../helper';
import HistoryHelper from 'elementor/tests/qunit/core/editor/document/history/helper';

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

			QUnit.module( 'History', () => {
				QUnit.test( 'Section', ( assert ) => {
					// Create Section at 0.
					DocumentHelper.createSection();

					const eSection = DocumentHelper.createSection( 3 ),
						originalPosition = eSection.view._index,
						targetPosition = 0;

					DocumentHelper.move( eSection, elementor.getPreviewContainer(), { at: targetPosition } );

					const historyItem = elementor.documents.getCurrent().history.getItems().at( 0 ).attributes;

					// Exist in history.
					HistoryHelper.inHistoryValidate( assert, historyItem, 'move', 'Section' );

					// Undo.
					HistoryHelper.undoValidate( assert, historyItem );

					const eSectionAfterUndo = eSection.lookup();

					assert.equal( eSectionAfterUndo.view._index, originalPosition,
						'Element has been returned to the original position' );

					// Redo.
					HistoryHelper.redoValidate( assert, historyItem );

					const eSectionAfterRedo = eSection.lookup();

					assert.equal( eSectionAfterRedo.view._index, targetPosition,
						'Element was re-added to correct position' );
				} );

				QUnit.test( 'Column between sections', ( assert ) => {
					const eSection1 = DocumentHelper.createSection(),
						eSection2 = DocumentHelper.createSection(),
						eColumn = DocumentHelper.createColumn( eSection1 ),
						originalPosition = eColumn.view._index,
						targetPosition = 1;

					DocumentHelper.move( eColumn, eSection2, { at: targetPosition } );

					const historyItem = elementor.documents.getCurrent().history.getItems().at( 0 ).attributes;

					// Exist in history.
					HistoryHelper.inHistoryValidate( assert, historyItem, 'move', 'Column' );

					// Undo.
					HistoryHelper.undoValidate( assert, historyItem );

					const eColumnAfterUndo = eColumn.lookup();

					assert.equal( eColumnAfterUndo.view._index, originalPosition,
						'Element has been returned to the original position' );

					// Redo.
					HistoryHelper.redoValidate( assert, historyItem );

					const eColumnAfterRedo = eColumn.lookup();

					assert.equal( eColumnAfterRedo.view._index, targetPosition,
						'Element was re-added to correct position' );
				} );

				QUnit.test( 'Column in same section', ( assert ) => {
					const eSection = DocumentHelper.createSection();

					/* eColumn1 = */ DocumentHelper.createColumn( eSection );

					const eColumn2 = DocumentHelper.createColumn( eSection ),
						originalPosition = eColumn2.view._index,
						targetPosition = 0;

					DocumentHelper.move( eColumn2, eSection, { at: targetPosition } );

					const historyItem = elementor.documents.getCurrent().history.getItems().at( 0 ).attributes;

					// Exist in history.
					HistoryHelper.inHistoryValidate( assert, historyItem, 'move', 'Column' );

					// Undo.
					HistoryHelper.undoValidate( assert, historyItem );

					const eColumnAfterUndo = eColumn2.lookup();

					assert.equal( eColumnAfterUndo.view._index, originalPosition,
						'Element has been returned to the original position' );

					// Redo.
					HistoryHelper.redoValidate( assert, historyItem );

					const eColumnAfterRedo = eColumn2.lookup();

					assert.equal( eColumnAfterRedo.view._index, targetPosition,
						'Element was re-added to correct position' );
				} );

				QUnit.test( 'Widget', ( assert ) => {
					const eSection = DocumentHelper.createSection(),
						eColumn1 = DocumentHelper.createColumn( eSection ),
						eColumn2 = DocumentHelper.createColumn( eSection ),
						eWidget = DocumentHelper.createButton( eColumn1 ),
						originalPosition = eWidget.view._index,
						targetPosition = 1;

					DocumentHelper.createButton( eColumn2 );
					DocumentHelper.createButton( eColumn2 );

					DocumentHelper.move( eWidget, eColumn2, { at: targetPosition } );

					const historyItem = elementor.documents.getCurrent().history.getItems().at( 0 ).attributes;

					// Exist in history.
					HistoryHelper.inHistoryValidate( assert, historyItem, 'move', 'Button' );

					// Undo.
					HistoryHelper.undoValidate( assert, historyItem );

					const eWidgetAfterUndo = eWidget.lookup();

					assert.equal( eWidgetAfterUndo.view._index, originalPosition,
						'Element has been returned to the original position' );

					// Redo.
					HistoryHelper.redoValidate( assert, historyItem );

					const eWidgetAfterRedo = eWidget.lookup();

					assert.equal( eWidgetAfterRedo.view._index, targetPosition,
						'Element was re-added to correct position' );
				} );
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
