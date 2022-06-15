const { test, expect } = require( '@playwright/test' );
const WpAdminPage = require( '../../pages/wp-admin-page.js' );

let page,
	editor,
	wpAdmin;

test.describe.serial( 'NestedElementsModule', () => {
	test.beforeAll( async ( { browser }, testInfo ) => {
		page = await browser.newPage();

		wpAdmin = new WpAdminPage( page, testInfo );

		await wpAdmin.setExperiments( {
			container: true,
			'nested-elements': true,
		} );
	} );

	test.beforeEach( async ( {}, testInfo ) => {
		wpAdmin = new WpAdminPage( page, testInfo );

		editor = await wpAdmin.useElementorCleanPost();
	} );

	test.afterAll( async ( {}, testInfo ) => {
		wpAdmin = new WpAdminPage( page, testInfo );

		await wpAdmin.setExperiments( {
			container: false,
			'nested-elements': false,
		} );
	} );

	test.describe( 'Component: `nested-elements`', () => {
		test.describe( 'Component: `nested-elements/nested-repeater`', () => {
			test.describe( 'Hooks', () => {
				test.describe( 'Data', () => {
					test( 'Hook: `nested-repeater-adjust-container-titles`', async () => {
						// Arrange, Open navigator.
						await editor.openNavigator();

						// Act - Add tabs-v2 widget.
						await editor.addWidget( 'tabs-v2', await editor.addElement( { elType: 'container' }, 'document' ) );

						// Click #elementor-navigator__toggle-all
						await editor.page.click( '#elementor-navigator__toggle-all' );

						// Assert - Ensure tabs-v2 widget has correct `_title`.
						await expect( editor.page.locator( '.elementor-navigator__element__title__text' ) ).toHaveText( [
							'Container',
							'Nested Tabs',
							'Tab #1',
							'Tab #2',
						] );
					} );

					test( 'Hook `nested-repeater-create-container`', async () => {
						// Arrange.
						const widgetId = await editor.addWidget( 'tabs-v2' );

						// Act.
						await editor.page.evaluate( ( [ id ] ) => {
							return $e.run( 'document/repeater/insert', {
								container: elementor.getContainer( id ),
								model: {
									tab_title: 'Tab #3',
								},
								name: 'tabs',
							} );
						}, [ widgetId ] );

						// Assert - Validate new inserted container title.
						await expect( editor.previewFrame.locator( 'text=Tab #3' ).first() ).toBeVisible();
					} );

					test( 'Hook `nested-repeater-create-container` -- Ensure item content get duplicated', async () => {
						// Arrange.
						const widgetId = await editor.addWidget( 'tabs-v2' ),
							containerId = await editor.page.evaluate( ( [ id ] ) => {
								const container = elementor.getContainer( id );
								return container.children[ 1 ].id;
							}, [ widgetId ] );

						await editor.addWidget( 'heading', containerId );

						// Act.
						await editor.page.evaluate( ( [ id ] ) => {
							return $e.run( 'document/repeater/duplicate', {
								container: elementor.getContainer( id ),
								index: 1,
								name: 'tabs',
							} );
						}, [ widgetId ] );

						// Assert.
						await expect( await editor.previewFrame.locator( 'text=Tab #2' ).count() ).toBe( 4 ); // 4 including the mobile.
						await expect( await editor.previewFrame.locator( 'text=Add Your Heading Text Here' ).count() ).toBe( 2 ); // Content.
					} );

					test( 'Hook `nested-repeater-remove-container`', async () => {
						// Arrange.
						const widgetId = await editor.addWidget( 'tabs-v2' );

						// Act.
						await editor.page.evaluate( ( [ id ] ) => {
							return $e.run( 'document/repeater/remove', {
								container: elementor.getContainer( id ),
								index: 2,
								name: 'tabs',
							} );
						}, [ widgetId ] );

						// Assert.
						await expect( await editor.previewFrame.locator( 'text=Tab #3' ) ).not.toBeVisible();
					} );
				} );
			} );
		} );
	} );
} );
