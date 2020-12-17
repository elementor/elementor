import ElementsHelper from '../../elements/helper';
import HistoryHelper from '../../history/helper';
import RepeaterHelper from '../helper';

export const Insert = () => {
	QUnit.module( 'Insert', () => {
		QUnit.module( 'Single Selection', () => {
			QUnit.test( 'Simple', ( assert ) => {
				const eColumn = ElementsHelper.createSection( 1, true ),
					eTabs = ElementsHelper.createTabs( eColumn );

				RepeaterHelper.insert( eTabs, 'tabs', {
					tab_title: 'Test Tab Title',
					tab_content: 'Test Tab Content',
				} );

				// Check.
				assert.equal( eTabs.settings.get( 'tabs' ).length, 3 );
			} );

			QUnit.test( 'History', ( assert ) => {
				const eColumn = ElementsHelper.createSection( 1, true ),
					eTabs = ElementsHelper.createTabs( eColumn ),
					originalItemsCount = eTabs.settings.get( 'tabs' ).length;

				RepeaterHelper.insert( eTabs, 'tabs', {
					tab_title: 'Test Tab Title',
					tab_content: 'Test Tab Content',
				} );

				const historyItem = HistoryHelper.getFirstItem().attributes;

				// Exist in history.
				HistoryHelper.inHistoryValidate( assert, historyItem, 'add', 'Tabs' );

				// Undo.
				HistoryHelper.undoValidate( assert, historyItem );

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
			QUnit.test( 'Simple', ( assert ) => {
				const eColumn = ElementsHelper.createSection( 1, true ),
					eTabs1 = ElementsHelper.createTabs( eColumn ),
					eTabs2 = ElementsHelper.createTabs( eColumn );

				RepeaterHelper.multiInsert( [ eTabs1, eTabs2 ], 'tabs', {
					tab_title: 'Test Tab Title',
					tab_content: 'Test Tab Content',
				} );

				// Check.
				assert.equal( eTabs1.settings.get( 'tabs' ).length, 3 );
				assert.equal( eTabs2.settings.get( 'tabs' ).length, 3 );
			} );

			QUnit.test( 'History', ( assert ) => {
				const eColumn = ElementsHelper.createSection( 1, true ),
					eTabs1 = ElementsHelper.createTabs( eColumn ),
					eTabs2 = ElementsHelper.createTabs( eColumn ),
					eMultiTabs = [ eTabs1, eTabs2 ],
					originalItemsCount = eTabs1.settings.get( 'tabs' ).length;

				RepeaterHelper.multiInsert( eMultiTabs, 'tabs', {
					tab_title: 'Test Tab Title',
					tab_content: 'Test Tab Content',
				} );

				const historyItem = HistoryHelper.getFirstItem().attributes;

				// Exist in history.
				HistoryHelper.inHistoryValidate( assert, historyItem, 'add', 'Elements' );

				// Undo.
				HistoryHelper.undoValidate( assert, historyItem );

				// Check item was removed.
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

export default Insert;
