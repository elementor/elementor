import DocumentHelper from '../helper';

jQuery( () => {
	QUnit.module( 'Component: document/repeater', () => {
		QUnit.module( 'Single Selection', () => {
			QUnit.test( 'Insert', ( assert ) => {
				const eColumn = DocumentHelper.createSection( 1, true ),
					eTabs = DocumentHelper.createTabs( eColumn );

				DocumentHelper.repeaterInsert( eTabs, 'tabs', {
					tab_title: 'Test Tab Title',
					tab_content: 'Test Tab Content',
				} );

				// Check.
				assert.equal( eTabs.settings.get( 'tabs' ).length, 3 );
			} );

			QUnit.test( 'Remove', ( assert ) => {
				const eColumn = DocumentHelper.createSection( 1, true ),
					eTabs = DocumentHelper.createTabs( eColumn );

				DocumentHelper.repeaterRemove( eTabs, 'tabs', 1 );

				// Check.
				assert.equal( eTabs.settings.get( 'tabs' ).length, 1 );
			} );

			QUnit.test( 'Settings', ( assert ) => {
				const eColumn = DocumentHelper.createSection( 1, true ),
					eTabs = DocumentHelper.createTabs( eColumn ),
					tabTitle = 'This is was changed';

				DocumentHelper.repeaterSettings( eTabs, 'tabs', 1, {
					tab_title: tabTitle,
				} );

				// Check.
				assert.equal( eTabs.settings.get( 'tabs' ).at( 1 ).get( 'tab_title' ), tabTitle );
			} );

			QUnit.test( 'Duplicate', ( assert ) => {
				const eColumn = DocumentHelper.createSection( 1, true ),
					eTabs = DocumentHelper.createTabs( eColumn );

				DocumentHelper.repeaterDuplicate( eTabs, 'tabs', 1 );

				// Check.
				assert.equal( eTabs.settings.get( 'tabs' ).length, 3 );
			} );

			QUnit.test( 'Duplicate: Unique ID', ( assert ) => {
				const duplicatedIndex = 1,
					eColumn = DocumentHelper.createSection( 1, true ),
					eTabs = DocumentHelper.createTabs( eColumn ),
					eItem = eTabs.settings.get( 'tabs' ).at( duplicatedIndex ),
					eDuplicatedItem = DocumentHelper.repeaterDuplicate( eTabs, 'tabs', duplicatedIndex );

				// Check ids are unique.
				assert.notEqual( eItem.get( '_id' ), eDuplicatedItem.get( '_id' ) );
			} );

			QUnit.test( 'Move', ( assert ) => {
				const eColumn = DocumentHelper.createSection( 1, true ),
					eTabs = DocumentHelper.createTabs( eColumn );

				DocumentHelper.repeaterMove( eTabs, 'tabs', 1, 0 );

				// Check.
				assert.equal( eTabs.settings.get( 'tabs' ).at( 0 ).get( 'tab_title' ), 'Tab #2' );
			} );
		} );

		QUnit.module( 'Multiple Selection', () => {
			QUnit.test( 'Insert', ( assert ) => {
				const eColumn = DocumentHelper.createSection( 1, true ),
					eTabs1 = DocumentHelper.createTabs( eColumn ),
					eTabs2 = DocumentHelper.createTabs( eColumn );

					DocumentHelper.multiRepeaterInsert( [ eTabs1, eTabs2 ], 'tabs', {
						tab_title: 'Test Tab Title',
						tab_content: 'Test Tab Content',
				} );

				// Check.
				assert.equal( eTabs1.settings.get( 'tabs' ).length, 3 );
				assert.equal( eTabs2.settings.get( 'tabs' ).length, 3 );
			} );

			QUnit.test( 'Remove', ( assert ) => {
				const eColumn = DocumentHelper.createSection( 1, true ),
					eTabs1 = DocumentHelper.createTabs( eColumn ),
					eTabs2 = DocumentHelper.createTabs( eColumn );

				DocumentHelper.multiRepeaterRemove( [ eTabs1, eTabs2 ], 'tabs', 1 );

				// Check.
				assert.equal( eTabs1.settings.get( 'tabs' ).length, 1 );
				assert.equal( eTabs2.settings.get( 'tabs' ).length, 1 );
			} );

			QUnit.test( 'Settings', ( assert ) => {
				const eColumn = DocumentHelper.createSection( 1, true ),
					eTabs1 = DocumentHelper.createTabs( eColumn ),
					eTabs2 = DocumentHelper.createTabs( eColumn ),
					tabTitle = 'This is was changed';

				DocumentHelper.multiRepeaterSettings( [ eTabs1, eTabs2 ], 'tabs', 1, {
					tab_title: tabTitle,
				} );

				// Check.
				assert.equal( eTabs1.settings.get( 'tabs' ).at( 1 ).get( 'tab_title' ), tabTitle );
				assert.equal( eTabs2.settings.get( 'tabs' ).at( 1 ).get( 'tab_title' ), tabTitle );
			} );

			QUnit.test( 'Duplicate', ( assert ) => {
				const eColumn = DocumentHelper.createSection( 1, true ),
					eTabs1 = DocumentHelper.createTabs( eColumn ),
					eTabs2 = DocumentHelper.createTabs( eColumn );

				DocumentHelper.multiRepeaterDuplicate( [ eTabs1, eTabs2 ], 'tabs', 1 );

				// Check.
				assert.equal( eTabs1.settings.get( 'tabs' ).length, 3 );
				assert.equal( eTabs2.settings.get( 'tabs' ).length, 3 );
			} );

			QUnit.test( 'Move', ( assert ) => {
				const eColumn = DocumentHelper.createSection( 1, true ),
					eTabs1 = DocumentHelper.createTabs( eColumn ),
					eTabs2 = DocumentHelper.createTabs( eColumn );

					DocumentHelper.multiRepeaterMove( [ eTabs1, eTabs2 ], 'tabs', 1, 0 );

				// Check.
				assert.equal( eTabs1.settings.get( 'tabs' ).at( 0 ).get( 'tab_title' ), 'Tab #2' );
				assert.equal( eTabs2.settings.get( 'tabs' ).at( 0 ).get( 'tab_title' ), 'Tab #2' );
			} );
		} );
	} );
} );
