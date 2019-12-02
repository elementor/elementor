import DocumentHelper from '../../helper';
import HistoryHelper from '../../history/helper';

export const Duplicate = () => {
	QUnit.module( 'Duplicate', () => {
		QUnit.module( 'Single Selection', () => {
			QUnit.test( 'Simple', ( assert ) => {
				const eColumn = DocumentHelper.createSection( 1, true ),
					eButton = DocumentHelper.createButton( eColumn ),
					eButtonDuplicateCount = 2;

				for ( let i = 0; i < eButtonDuplicateCount; ++i ) {
					const eDuplicatedButton = DocumentHelper.duplicate( eButton );

					// Check if duplicated buttons have unique ids.
					assert.notEqual( eDuplicatedButton.id, eButton.id,
						`Duplicate button # ${ i + 1 } have unique id.` );
				}

				// Check duplicated button exist.
				assert.equal( eColumn.view.children.length, ( eButtonDuplicateCount + 1 ),
					`'${ eButtonDuplicateCount }' buttons were duplicated.` );
			} );

			QUnit.test( 'History', ( assert ) => {
				const eWidget = DocumentHelper.createAutoButton(),
					eWidgetDuped = DocumentHelper.duplicate( eWidget ),
					historyItem = elementor.history.history.getItems().at( 0 ).attributes;

				// Exist in history.
				HistoryHelper.inHistoryValidate( assert, historyItem, 'duplicate', 'Button' );

				// Undo.
				HistoryHelper.undoValidate( assert, historyItem );

				// Element Does not exist.
				HistoryHelper.destroyedValidate( assert, eWidgetDuped );

				// Redo.
				HistoryHelper.redoValidate( assert, historyItem );

				// Element exist again.
				HistoryHelper.recreatedValidate( assert, eWidgetDuped );
			} );
		} );

		QUnit.module( 'Multiple Selection', () => {
			QUnit.test( 'Simple', ( assert ) => {
				const eColumn1 = DocumentHelper.createSection( 1, true ),
					eColumn2 = DocumentHelper.createSection( 1, true ),
					eButtons = DocumentHelper.multiCreateButton( [ eColumn1, eColumn2 ] );

				DocumentHelper.multiDuplicate( eButtons );

				// Check duplicated button exist.
				assert.equal( eColumn1.view.children.length, 2, 'Two buttons were created.' );
				assert.equal( eColumn2.view.children.length, 2, 'Two buttons were duplicated.' );
			} );

			QUnit.test( 'History', ( assert ) => {
				const eWidgets = DocumentHelper.multiCreateAutoButton(),
					eWidgetsDuped = DocumentHelper.multiDuplicate( eWidgets ),
					historyItem = elementor.history.history.getItems().at( 0 ).attributes;

				// Exist in history.
				HistoryHelper.inHistoryValidate( assert, historyItem, 'duplicate', 'elements' );

				// Undo.
				HistoryHelper.undoValidate( assert, historyItem );

				// Element Does not exist.
				eWidgetsDuped.forEach( ( eWidgetDuped ) =>
					HistoryHelper.destroyedValidate( assert, eWidgetDuped )
				);

				// Redo.
				HistoryHelper.redoValidate( assert, historyItem );

				// Element exist again.
				eWidgetsDuped.forEach( ( eWidgetDuped ) =>
					HistoryHelper.recreatedValidate( assert, eWidgetDuped )
				);
			} );
		} );
	} );
};

export default Duplicate;
