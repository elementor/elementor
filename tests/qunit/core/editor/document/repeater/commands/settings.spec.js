import DocumentHelper from '../../helper';
import HistoryHelper from '../../history/helper';

export const Settings = () => {
	QUnit.module( 'Settings', () => {
		QUnit.module( 'Single Selection', () => {
			QUnit.test( 'Simple', ( assert ) => {
				const eColumn = DocumentHelper.createSection( 1, true ),
					eTabs = DocumentHelper.createTabs( eColumn ),
					tabTitle = 'This is was changed';

				DocumentHelper.repeaterSettings( eTabs, 'tabs', 1, {
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
				const eColumn = DocumentHelper.createSection( 1, true ),
					eTabs = DocumentHelper.createTabs( eColumn ),
					tabTitle = 'This is was changed',
					index = 1,
					eTab = eTabs.settings.get( 'tabs' ).at( index ),
					originalTitle = eTab.get( 'tab_title' );

				DocumentHelper.repeaterSettings( eTabs, 'tabs', index, {
					tab_title: tabTitle,
				} );

				const done = assert.async(); // Pause the test till done.

				setTimeout( () => {
					const historyItem = elementor.history.history.getItems().at( 0 ).attributes;

					// Exist in history.
					HistoryHelper.inHistoryValidate( assert, historyItem, 'change', `Tabs Item#${ index + 1 }` );

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
				const eColumn = DocumentHelper.createSection( 1, true ),
					eTabs1 = DocumentHelper.createTabs( eColumn ),
					eTabs2 = DocumentHelper.createTabs( eColumn ),
					tabTitle = 'This is was changed';

				DocumentHelper.multiRepeaterSettings( [ eTabs1, eTabs2 ], 'tabs', 1, {
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
				const eColumn = DocumentHelper.createSection( 1, true ),
					eTabs1 = DocumentHelper.createTabs( eColumn ),
					eTabs2 = DocumentHelper.createTabs( eColumn ),
					index = 1,
					eMultiTabs = [ eTabs1, eTabs2 ],
					tabTitle = 'This is was changed',
					defaultTitle = eTabs1.settings.get( 'tabs' ).at( index ).get( 'tab_title' );

				DocumentHelper.multiRepeaterSettings( eMultiTabs, 'tabs', index, {
					tab_title: tabTitle,
				} );

				const done = assert.async(); // Pause the test till done.

				setTimeout( () => {
					const historyItem = elementor.history.history.getItems().at( 0 ).attributes;

					// Exist in history.
					HistoryHelper.inHistoryValidate( assert, historyItem, 'change', 'elements' );

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
