import ElementsHelper from '../../elements/helper';
import HistoryHelper from '../../history/helper';
import RepeaterHelper from '../helper';

export const Settings = () => {
	QUnit.module( 'Settings', () => {
		QUnit.module( 'Single Selection', () => {
			QUnit.test( 'Simple', ( assert ) => {
				const eColumn = ElementsHelper.createSection( 1, true ),
					eTabs = ElementsHelper.createTabs( eColumn ),
					tabTitle = 'This is was changed';

				RepeaterHelper.settings( eTabs, 'tabs', 1, {
					tab_title: tabTitle,
				} );

				const done = assert.async();

				setTimeout( () => {
					// Check.
					assert.equal( eTabs.settings.get( 'tabs' ).at( 1 ).get( 'tab_title' ), tabTitle );

					done();
				} );
			} );

			QUnit.test( 'History', ( assert ) => {
				const eColumn = ElementsHelper.createSection( 1, true ),
					eTabs = ElementsHelper.createTabs( eColumn ),
					tabTitle = 'This is was changed',
					index = 1,
					eTab = eTabs.settings.get( 'tabs' ).at( index ),
					originalTitle = eTab.get( 'tab_title' );

				RepeaterHelper.settings( eTabs, 'tabs', index, {
					tab_title: tabTitle,
				} );

				const done = assert.async(); // Pause the test till done.

				setTimeout( () => {
					const historyItem = HistoryHelper.getFirstItem().attributes;

					// Exist in history.
					HistoryHelper.inHistoryValidate( assert, historyItem, 'change', `Tabs Item` );

					// Undo.
					HistoryHelper.undoValidate( assert, historyItem );

					// Settings back to default.
					assert.equal( eTab.get( 'tab_title' ), originalTitle, 'Settings back to default' );

					// Redo.
					HistoryHelper.redoValidate( assert, historyItem );

					// Settings restored.
					assert.equal( eTab.get( 'tab_title' ), tabTitle, 'Settings restored' );

					done();
				} );
			} );
		} );

		QUnit.module( 'Multiple Selection', () => {
			QUnit.test( 'Simple', ( assert ) => {
				const eColumn = ElementsHelper.createSection( 1, true ),
					eTabs1 = ElementsHelper.createTabs( eColumn ),
					eTabs2 = ElementsHelper.createTabs( eColumn ),
					tabTitle = 'This is was changed';

				RepeaterHelper.multiSettings( [ eTabs1, eTabs2 ], 'tabs', 1, {
					tab_title: tabTitle,
				} );

				const done = assert.async();

				setTimeout( () => {
					// Check.
					assert.equal( eTabs1.settings.get( 'tabs' ).at( 1 ).get( 'tab_title' ), tabTitle );
					assert.equal( eTabs2.settings.get( 'tabs' ).at( 1 ).get( 'tab_title' ), tabTitle );

					done();
				} );
			} );

			QUnit.test( 'History', ( assert ) => {
				const eColumn = ElementsHelper.createSection( 1, true ),
					eTabs1 = ElementsHelper.createTabs( eColumn ),
					eTabs2 = ElementsHelper.createTabs( eColumn ),
					index = 1,
					eMultiTabs = [ eTabs1, eTabs2 ],
					tabTitle = 'This is was changed',
					defaultTitle = eTabs1.settings.get( 'tabs' ).at( index ).get( 'tab_title' );

				RepeaterHelper.multiSettings( eMultiTabs, 'tabs', index, {
					tab_title: tabTitle,
				} );

				const done = assert.async(); // Pause the test till done.

				setTimeout( () => {
					const historyItem = HistoryHelper.getFirstItem().attributes;

					// Exist in history.
					HistoryHelper.inHistoryValidate( assert, historyItem, 'change', 'Elements' );

					// Undo.
					HistoryHelper.undoValidate( assert, historyItem );

					// Check settings were changed.
					eMultiTabs.forEach( ( eTabs ) => {
						assert.equal( eTabs.settings.get( 'tabs' ).at( index ).get( 'tab_title' ), defaultTitle,
							`For Tab: '${ eTabs.id }' - Setting was changed` );
					} );

					// Redo.
					HistoryHelper.redoValidate( assert, historyItem );

					// Check settings were restored.
					eMultiTabs.forEach( ( eTabs ) => {
						assert.equal( eTabs.settings.get( 'tabs' ).at( index ).get( 'tab_title' ), tabTitle,
							`For Tab: '${ eTabs.id }' - Setting was restored` );
					} );

					done();
				} );
			} );
		} );
	} );
};

export default Settings;
