import DocumentHelper from '../../helper';
import HistoryHelper from '../../history/helper';

export const Duplicate = () => {
	QUnit.module( 'Duplicate', () => {
		QUnit.module( 'Single Selection', () => {
			QUnit.test( 'Simple', ( assert ) => {
				const eColumn = DocumentHelper.createSection( 1, true ),
					eTabs = DocumentHelper.createTabs( eColumn );

				DocumentHelper.repeaterDuplicate( eTabs, 'tabs', 1 );

				// Check.
				assert.equal( eTabs.settings.get( 'tabs' ).length, 3 );
			} );

			QUnit.test( 'Unique ID', ( assert ) => {
				const duplicatedIndex = 1,
					eColumn = DocumentHelper.createSection( 1, true ),
					eTabs = DocumentHelper.createTabs( eColumn ),
					eItem = eTabs.settings.get( 'tabs' ).at( duplicatedIndex ),
					eDuplicatedItem = DocumentHelper.repeaterDuplicate( eTabs, 'tabs', duplicatedIndex );

				// Check ids are unique.
				assert.notEqual( eItem.get( '_id' ), eDuplicatedItem.get( '_id' ) );
			} );

			QUnit.test( 'History', ( assert ) => {
				const eColumn = DocumentHelper.createSection( 1, true ),
					eTabs = DocumentHelper.createTabs( eColumn ),
					originalItemsCount = eTabs.settings.get( 'tabs' ).length;

				DocumentHelper.repeaterDuplicate( eTabs, 'tabs', 1 );

				const historyItem = elementor.documents.getCurrent().history.getItems().at( 0 ).attributes;

				// Exist in history.
				HistoryHelper.inHistoryValidate( assert, historyItem, 'duplicate', 'Tabs' );

				// Undo.
				HistoryHelper.undoValidate( assert, historyItem );

				// Check item was removed.
				assert.equal( eTabs.settings.get( 'tabs' ).length, originalItemsCount,
					'Item was removed from the model' );

				// Redo.
				HistoryHelper.redoValidate( assert, historyItem );

				// Check item restored.
				assert.equal( eTabs.settings.get( 'tabs' ).length, ( originalItemsCount + 1 ),
					'Item were restored to the model' );
			} );
		} );

		QUnit.module( 'Multiple Selection', () => {
			QUnit.test( 'History', ( assert ) => {
				const eColumn = DocumentHelper.createSection( 1, true ),
					eTabs1 = DocumentHelper.createTabs( eColumn ),
					eTabs2 = DocumentHelper.createTabs( eColumn ),
					eMultiTabs = [ eTabs1, eTabs2 ],
					originalItemsCount = eTabs1.settings.get( 'tabs' ).length;

				DocumentHelper.multiRepeaterDuplicate( [ eTabs1, eTabs2 ], 'tabs', 1 );

				const historyItem = elementor.documents.getCurrent().history.getItems().at( 0 ).attributes;

				// Exist in history.
				HistoryHelper.inHistoryValidate( assert, historyItem, 'duplicate', 'elements' );

				// Undo.
				HistoryHelper.undoValidate( assert, historyItem );

				eMultiTabs.forEach( ( eTabs ) => {
					assert.equal( eTabs.settings.get( 'tabs' ).length, originalItemsCount,
						`For Tab: '${ eTabs.id }' - item was removed from the model` );
				} );

				// Redo.
				HistoryHelper.redoValidate( assert, historyItem );

				// Check item restored.
				eMultiTabs.forEach( ( eTabs ) => {
					assert.equal( eTabs.settings.get( 'tabs' ).length, ( originalItemsCount + 1 ),
						`For Tab: '${ eTabs.id }' - Item were restored to the model` );
				} );
			} );
		} );
	} );
};

export default Duplicate;
