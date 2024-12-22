import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../parallelTest';
import WpAdminPage from '../../../pages/wp-admin-page';
import { getInSettingsTab } from './styleguide.helper';

test.describe( 'Styleguide Preview tests @styleguide_image_link', () => {
	const fontsContentText = 'The five boxing wizards jump quickly.';

	test.beforeAll( async ( { browser, apiRequests }, testInfo ) => {
		const page = await browser.newPage();
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		await wpAdmin.resetExperiments();

		await page.close();
	} );

	test( 'Change font title', async ( { page, apiRequests }, testInfo ) => {
		// Arrange.
		const { editor } = await getInSettingsTab( page, testInfo, apiRequests, 'Global Fonts', true );

		const input = page.locator( '.elementor-repeater-fields' ).nth( 2 );

		// Act - Click on font in preview.
		await input.click();
		await input.type( 'more' );

		// Assert
		const TextFont = editor.getPreviewFrame().getByText( 'Textmore' + fontsContentText );
		await expect( TextFont ).toContainText( 'Textmore' );
	} );

	test( 'Change color title', async ( { page, apiRequests }, testInfo ) => {
		// Arrange.
		const { editor } = await getInSettingsTab( page, testInfo, apiRequests, 'Global Colors', true );

		const input = page.locator( '.elementor-repeater-fields' ).nth( 1 );

		// Act - Change title.
		await input.click();
		await input.type( 'more' );

		// Assert
		const secondaryColor = editor.getPreviewFrame().getByText( /Secondarymore#[A-Fa-f0-9]{6}/i );
		await expect( secondaryColor ).toContainText( 'Secondarymore' );
	} );

	test( 'Adding and removing new colors', async ( { page, apiRequests }, testInfo ) => {
		// Arrange.
		const { editor } = await getInSettingsTab( page, testInfo, apiRequests, 'Global Colors', true );

		const picker = page.locator( '.elementor-repeater-fields' ).nth( 4 ).locator( '.pcr-button' );
		const addButton = page.getByRole( 'button', { name: 'Add Color' } );

		// Act.
		await addButton.click();
		await picker.click();
		await page.locator( '.pcr-result' ).nth( 4 ).fill( '#594833' );
		await picker.click();

		// Assert
		expect( await editor.getPreviewFrame().getByText( /New Item #1#594833/i ).count() ).toEqual( 1 );

		// Arrange 2.
		const listItem = page.locator( '.elementor-repeater-fields' ).nth( 4 ).locator( '.elementor-control-input-wrapper' ).nth( 1 );
		const remove = listItem.locator( '.eicon-trash-o' );

		// Act 2 - Click on remove.
		await listItem.hover();
		await remove.click();
		await page.getByRole( 'button', { name: 'Delete' } ).click();

		// Assert 2
		const number = await editor.getPreviewFrame().getByText( /New Item #1#/i ).count();
		expect( number ).toEqual( 0 );
	} );

	test( 'Adding and removing new fonts', async ( { page, apiRequests }, testInfo ) => {
		// Arrange.
		const { editor } = await getInSettingsTab( page, testInfo, apiRequests, 'Global Fonts', true );
		const addButton = page.getByRole( 'button', { name: 'Add Style' } );

		// Act.
		await addButton.click();

		// Assert
		const customFontsCount = await page.locator( '.elementor-control-custom_typography .elementor-repeater-fields' ).count();
		expect( await editor.getPreviewFrame().getByText( 'New Item #' + customFontsCount + fontsContentText ).count() ).toEqual( 1 );

		// Arrange 2.
		const listItem = page.locator( '.elementor-control-custom_typography .elementor-repeater-fields' ).last().locator( '.elementor-control-input-wrapper' ).nth( 1 );
		const remove = listItem.locator( '.eicon-trash-o' );

		// Act 2 - Click on remove.
		await listItem.hover();
		await remove.click();
		await page.getByRole( 'button', { name: 'Delete' } ).click();

		// Assert 2
		const number = await editor.getPreviewFrame().getByText( 'New Item #' + customFontsCount + fontsContentText ).count();
		expect( number ).toEqual( 0 );
	} );

	test( 'Changed color in picker to reflect in styleguide', async ( { page, apiRequests }, testInfo ) => {
		// Arrange.
		const { editor } = await getInSettingsTab( page, testInfo, apiRequests, 'Global Colors', true );
		const secondaryColor = editor.getPreviewFrame().getByText( /Secondary#[A-Fa-f0-9]{6}/i );

		const picker = page.locator( '.elementor-repeater-fields' ).nth( 1 ).locator( '.pcr-button' );
		// Act.
		await picker.click();
		await page.locator( '.pcr-result' ).nth( 1 ).fill( '#594833' );

		// Assert
		await expect( secondaryColor.locator( 'div' ).first() ).toHaveCSS( 'background-color', 'rgb(89, 72, 51)' );
	} );

	test( 'Changed font values in picker to reflect in styleguide', async ( { page, apiRequests }, testInfo ) => {
		// Arrange.
		const { editor } = await getInSettingsTab( page, testInfo, apiRequests, 'Global Fonts', true );

		const textFont = editor.getPreviewFrame().getByText( 'Text' + fontsContentText );
		const picker = page.locator( '.elementor-repeater-fields' ).nth( 2 ).locator( '.eicon-edit' ).first();

		// Act.
		await picker.click();
		const select = page.locator( '.elementor-repeater-fields' ).nth( 2 ).getByRole( 'combobox', { name: 'Style' } );
		await select.selectOption( { label: 'Italic' } );
		const select2 = page.locator( '.elementor-repeater-fields' ).nth( 2 ).getByRole( 'combobox', { name: 'Decoration' } );
		await select2.selectOption( { label: 'Underline' } );

		// Assert
		const content = textFont.locator( 'p' ).nth( 1 );
		await expect( content ).toHaveCSS( 'font-style', 'italic' );
		await expect( content ).toHaveCSS( 'text-decoration-line', 'underline' );
	} );

	test( 'Clicking header buttons makes relevant area visible', async ( { page, apiRequests }, testInfo ) => {
		// Arrange.
		const { editor } = await getInSettingsTab( page, testInfo, apiRequests, 'Global Colors', true );

		const fontsButton = editor.getPreviewFrame().getByRole( 'button', { name: 'Fonts' } );
		const colorButton = editor.getPreviewFrame().getByRole( 'button', { name: 'Colors' } );

		// Act.
		await fontsButton.click();

		// Assert
		await expect( editor.getPreviewFrame().getByText( 'Global Fonts' ) ).toBeVisible();

		// Act 2.
		await colorButton.click();

		// Assert 2
		await expect( editor.getPreviewFrame().getByText( 'Global Colors' ) ).toBeVisible();
	} );

	test( 'Clicks on font trigger picker state and active state', async ( { page, apiRequests }, testInfo ) => {
		// Arrange.
		const { editor } = await getInSettingsTab( page, testInfo, apiRequests, 'Global Fonts', true );

		const secondaryFont = editor.getPreviewFrame().getByText( 'Secondary' + fontsContentText );
		const picker = page.locator( '.elementor-control-popover-toggle-toggle-label' ).nth( 1 );

		// Act 1. Click on font in preview.
		await secondaryFont.click();

		// Assert 1.
		await expect( secondaryFont ).toHaveClass( /active/ );
		expect( await page.getByText( 'Typography' ).nth( 1 ).isVisible() ).toBeTruthy();

		// Act 2. click on font again nothing happens.
		await secondaryFont.click();

		// Assert 2.
		await expect( secondaryFont ).toHaveClass( /active/ );
		expect( await page.getByText( 'Typography' ).nth( 1 ).isVisible() ).toBeTruthy();

		// Arrange 3.
		await secondaryFont.click();

		// Act 3. Click picker after already active.
		await picker.click();

		// Assert 3.
		await expect( secondaryFont ).not.toHaveClass( /active/ );
	} );
} );
