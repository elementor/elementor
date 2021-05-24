import ElementsHelper from '../../elements/helper';
import HistoryHelper from '../../history/helper';
import RepeaterHelper from '../helper';

export const Remove = () => {
	QUnit.module( 'Remove', () => {
		QUnit.module( 'Single Selection', () => {
			QUnit.test( 'Simple', ( assert ) => {
				const eColumn = ElementsHelper.createSection( 1, true ),
					eTabs = ElementsHelper.createTabs( eColumn );

				RepeaterHelper.remove( eTabs, 'tabs', 1 );

				// Check.
				assert.equal( eTabs.settings.get( 'tabs' ).length, 1 );
			} );

			QUnit.test( 'History', ( assert ) => {
				const eColumn = ElementsHelper.createSection( 1, true ),
					eTabs = ElementsHelper.createTabs( eColumn ),
					originalItemsCount = eTabs.settings.get( 'tabs' ).length;

				RepeaterHelper.remove( eTabs, 'tabs', 1 );

				const historyItem = HistoryHelper.getFirstItem().attributes;

				// Exist in history.
				HistoryHelper.inHistoryValidate( assert, historyItem, 'remove', 'Tabs' );

				// Undo.
				HistoryHelper.undoValidate( assert, historyItem );

				// Check item restored.
				assert.equal( eTabs.settings.get( 'tabs' ).length, originalItemsCount,
					'Item were restored to the model' );

				// Redo.
				HistoryHelper.redoValidate( assert, historyItem );

				// Check item was removed.
				assert.equal( eTabs.settings.get( 'tabs' ).length, ( originalItemsCount - 1 ),
					'Item was removed from the model' );
			} );
		} );

		QUnit.module( 'Multiple Selection', () => {
			QUnit.test( 'Simple', ( assert ) => {
				const eColumn = ElementsHelper.createSection( 1, true ),
					eTabs1 = ElementsHelper.createTabs( eColumn ),
					eTabs2 = ElementsHelper.createTabs( eColumn );

				RepeaterHelper.multiRemove( [ eTabs1, eTabs2 ], 'tabs', 1 );

				// Check.
				assert.equal( eTabs1.settings.get( 'tabs' ).length, 1 );
				assert.equal( eTabs2.settings.get( 'tabs' ).length, 1 );
			} );

			QUnit.test( 'History', ( assert ) => {
				const eColumn = ElementsHelper.createSection( 1, true ),
					eTabs1 = ElementsHelper.createTabs( eColumn ),
					eTabs2 = ElementsHelper.createTabs( eColumn ),
					eMultiTabs = [ eTabs1, eTabs2 ],
					originalItemsCount = eTabs1.settings.get( 'tabs' ).length;

				RepeaterHelper.multiRemove( eMultiTabs, 'tabs', 1 );

				const historyItem = HistoryHelper.getFirstItem().attributes;

				// Exist in history.
				HistoryHelper.inHistoryValidate( assert, historyItem, 'remove', 'Elements' );

				// Undo.
				HistoryHelper.undoValidate( assert, historyItem );

				// Check item restored.
				eMultiTabs.forEach( ( eTabs ) => {
					assert.equal( eTabs.settings.get( 'tabs' ).length, originalItemsCount,
						`For Tab: '${ eTabs.id }' - Item were restored to the model` );
				} );

				// Redo.
				HistoryHelper.redoValidate( assert, historyItem );

				// Check item was removed.
				eMultiTabs.forEach( ( eTabs ) => {
					assert.equal( eTabs.settings.get( 'tabs' ).length, ( originalItemsCount - 1 ),
						`For Tab: '${ eTabs.id }' - item was removed from the model` );
				} );
			} );
		} );
	} );
};

export default Remove;
