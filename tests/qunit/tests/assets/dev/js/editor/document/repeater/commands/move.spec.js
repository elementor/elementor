import ElementsHelper from '../../elements/helper';
import HistoryHelper from '../../history/helper';
import RepeaterHelper from '../helper';

export const Move = () => {
	QUnit.module( 'Move', () => {
		QUnit.module( 'Single Selection', () => {
			QUnit.test( 'Simple', ( assert ) => {
				const eColumn = ElementsHelper.createSection( 1, true ),
					eTabs = ElementsHelper.createTabs( eColumn );

				RepeaterHelper.move( eTabs, 'tabs', 1, 0 );

				// Check.
				assert.equal( eTabs.settings.get( 'tabs' ).at( 0 ).get( 'tab_title' ), 'Tab #2' );
			} );

			QUnit.test( 'History', ( assert ) => {
				const eColumn = ElementsHelper.createSection( 1, true ),
					eTabs = ElementsHelper.createTabs( eColumn ),
					sourceIndex = 1,
					targetIndex = 0,
					eTabModel = eTabs.settings.get( 'tabs' ).at( sourceIndex );

				RepeaterHelper.move( eTabs, 'tabs', sourceIndex, targetIndex );

				const historyItem = HistoryHelper.getFirstItem().attributes;

				// Exist in history.
				HistoryHelper.inHistoryValidate( assert, historyItem, 'move', 'Tabs' );

				// Undo.
				HistoryHelper.undoValidate( assert, historyItem );

				// Check item moved to sourceIndex
				assert.equal( eTabs.settings.get( 'tabs' ).at( sourceIndex ).id,
					eTabModel.id, 'Item back to sourceIndex' );

				// Redo.
				HistoryHelper.redoValidate( assert, historyItem );

				// Check item moved to targetIndex
				assert.equal( eTabs.settings.get( 'tabs' ).at( targetIndex ).id,
					eTabModel.id, 'Item restored to targetIndex' );
			} );
		} );

		QUnit.module( 'Multiple Selection', () => {
			QUnit.test( 'Simple', ( assert ) => {
				const eColumn = ElementsHelper.createSection( 1, true ),
					eTabs1 = ElementsHelper.createTabs( eColumn ),
					eTabs2 = ElementsHelper.createTabs( eColumn );

				RepeaterHelper.multiMove( [ eTabs1, eTabs2 ], 'tabs', 1, 0 );

				// Check.
				assert.equal( eTabs1.settings.get( 'tabs' ).at( 0 ).get( 'tab_title' ), 'Tab #2' );
				assert.equal( eTabs2.settings.get( 'tabs' ).at( 0 ).get( 'tab_title' ), 'Tab #2' );
			} );

			QUnit.test( 'History', ( assert ) => {
				const eColumn = ElementsHelper.createSection( 1, true ),
					eTabs1 = ElementsHelper.createTabs( eColumn ),
					eTabs2 = ElementsHelper.createTabs( eColumn ),
					eMultiTabs = [ eTabs1, eTabs2 ],
					sourceIndex = 1,
					targetIndex = 0,
					eTabItem1 = eTabs1.settings.get( 'tabs' ).at( sourceIndex ),
					eTabItem2 = eTabs2.settings.get( 'tabs' ).at( sourceIndex ),
					eTabItems = [ eTabItem1, eTabItem2 ];

				RepeaterHelper.multiMove( eMultiTabs, 'tabs', sourceIndex, targetIndex );

				const historyItem = HistoryHelper.getFirstItem().attributes;
				let count = 0;

				// Exist in history.
				HistoryHelper.inHistoryValidate( assert, historyItem, 'move', 'Elements' );

				// Undo.
				HistoryHelper.undoValidate( assert, historyItem );

				// Check item moved to sourceIndex
				count = 0;
				eMultiTabs.forEach( ( eTabs ) => {
					assert.equal( eTabs.settings.get( 'tabs' ).at( sourceIndex ).id, eTabItems[ count ].id,
						`Tab#${ count + 1 } - Item back to sourceIndex` );
					++count;
				} );

				// Redo.
				HistoryHelper.redoValidate( assert, historyItem );

				// Check item moved to targetIndex
				count = 0;
				eMultiTabs.forEach( ( eTabs ) => {
					assert.equal( eTabs.settings.get( 'tabs' ).at( targetIndex ).id, eTabItems[ count ].id,
						`Tab#${ count + 1 } - Item back to targetIndex` );
					++count;
				} );
			} );
		} );
	} );
};

export default Move;
