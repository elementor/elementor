import Elements from '../../helpers/elements';

jQuery( () => {
	QUnit.module( 'Component: document/elements/repeater' );

	QUnit.module( 'Single Selection', () => {
		QUnit.test( 'Insert', ( assert ) => {
			const eColumn = Elements.createSection( 1, true ),
				eTabs = Elements.createTabs( eColumn );

			Elements.repeaterInsert( eTabs, 'tabs', {
				tab_title: 'Test Tab Title',
				tab_content: 'Test Tab Content',
			} );

			// Check.
			assert.equal( eTabs.getEditModel().get( 'settings' ).get( 'tabs' ).length, 3 );
		} );

		QUnit.test( 'Remove', ( assert ) => {
			const eColumn = Elements.createSection( 1, true ),
				eTabs = Elements.createTabs( eColumn );

			Elements.repeaterRemove( eTabs, 'tabs', 1 );

			// Check.
			assert.equal( eTabs.getEditModel().get( 'settings' ).get( 'tabs' ).length, 1 );
		} );

		QUnit.test( 'Settings', ( assert ) => {
			const eColumn = Elements.createSection( 1, true ),
				eTabs = Elements.createTabs( eColumn ),
				tabTitle = 'This is was changed';

			Elements.repeaterSettings( eTabs, 'tabs', 1, {
				tab_title: tabTitle,
			} );

			// Check.
			assert.equal( eTabs.getEditModel().get( 'settings' ).get( 'tabs' ).at( 1 ).get( 'tab_title' ), tabTitle );
		} );

		QUnit.test( 'Duplicate', ( assert ) => {
			const eColumn = Elements.createSection( 1, true ),
				eTabs = Elements.createTabs( eColumn );

			Elements.repeaterDuplicate( eTabs, 'tabs', 1 );

			// Check.
			assert.equal( eTabs.getEditModel().get( 'settings' ).get( 'tabs' ).length, 3 );
		} );

		QUnit.test( 'Move', ( assert ) => {
			const eColumn = Elements.createSection( 1, true ),
				eTabs = Elements.createTabs( eColumn );

			Elements.repeaterMove( eTabs, 'tabs', 1, 0 );

			// Check.
			assert.equal( eTabs.getEditModel().get( 'settings' ).get( 'tabs' ).at( 0 ).get( 'tab_title' ), 'Tab #2' );
		} );
	} );
} );
