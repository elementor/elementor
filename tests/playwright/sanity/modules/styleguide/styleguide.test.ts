import { test, expect } from '@playwright/test';
import WpAdminPage from '../../../pages/wp-admin-page';

test.describe( 'Styleguide Preview tests @styleguide_image_link', () => {
	const fontsContentText = 'The five boxing wizards jump quickly.';

	test.beforeAll( async ( { browser } ) => {
		const page = await browser.newPage();
		await page.close();
	} );

	test( 'Enabling Styleguide Preview user preference enabled Styleguide Preview at Global Colors and Global Typography', async ( { page }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo );
		const editor = await wpAdmin.openNewPage();
		page.setDefaultTimeout( 20000 );

		await page.evaluate( () => $e.run( 'document/elements/settings', {
			container: elementor.settings.editorPreferences.getEditedView().getContainer(),
			settings: {
				enable_styleguide_preview: '',
			},
			options: {
				external: true,
			},
		} ) );

		await page.waitForTimeout( 3000 );

		await Promise.all( [
			page.waitForResponse( '/wp-admin/admin-ajax.php' ),
			page.locator( '#elementor-panel-header-menu-button' ).click(),
			page.click( 'text=User Preferences' ),
		] );

		const userPreferencesStyleguideSwitcherSelector = 'input[type=checkbox][data-setting="enable_styleguide_preview"]';
		const userPreferencesStyleguideSwitcherBeforeClick = await page.isChecked( userPreferencesStyleguideSwitcherSelector );

		await Promise.all( [
			page.waitForResponse( '/wp-admin/admin-ajax.php' ),
			page.click( '.elementor-control-title:has-text("Show global settings")' ),
			page.waitForTimeout( 3000 ),
		] );

		const userPreferencesStyleguideSwitcherAfterClick = await page.isChecked( userPreferencesStyleguideSwitcherSelector );

		await Promise.all( [
			page.waitForResponse( '/wp-admin/admin-ajax.php' ),
			editor.openSiteSettings(),
		] );

		// Assert.
		expect( userPreferencesStyleguideSwitcherBeforeClick ).toBeFalsy();
		expect( userPreferencesStyleguideSwitcherAfterClick ).toBeTruthy();

		// Global Colors.
		// Act.
		await page.click( '.elementor-panel-menu-item-title:has-text("Global Colors")' );

		const siteSettingsColorsStyleguideSwitcherIsChecked = await page.isChecked( 'input[type=checkbox][data-setting="colors_enable_styleguide_preview"]' );
		const styleguidePreviewDialog = editor.getPreviewFrame().locator( '#e-styleguide-preview-dialog' );

		// Assert.
		expect( siteSettingsColorsStyleguideSwitcherIsChecked ).toBeTruthy();
		await expect( styleguidePreviewDialog ).toBeVisible();

		// Global Typography.
		// Act 1.
		await page.locator( '#elementor-panel-header-kit-back' ).click();
		await styleguideSaveChanges( page );

		// Assert 1.
		await expect( styleguidePreviewDialog ).toBeHidden();

		// Act 2.
		await page.click( '.elementor-panel-menu-item-title:has-text("Global Fonts")' );
		await editor.openSection( 'section_text_style' );

		const siteSettingsTypographyStyleguideSwitcherIsChecked = await page.isChecked( 'input[type=checkbox][data-setting="typography_enable_styleguide_preview"]' );

		// Assert 2.
		expect( siteSettingsTypographyStyleguideSwitcherIsChecked ).toBeTruthy();
		await expect( styleguidePreviewDialog ).toBeVisible();
	} );

	test( 'Disabling Styleguide Preview user preference disables Styleguide Preview at Global Colors and Global Typography', async ( { page }, testInfo ) => {
		// Arrange.

		const wpAdmin = new WpAdminPage( page, testInfo );
		const editor = await wpAdmin.openNewPage();
		page.setDefaultTimeout( 20000 );

		await page.evaluate( () => $e.run( 'document/elements/settings', {
			container: elementor.settings.editorPreferences.getEditedView().getContainer(),
			settings: {
				enable_styleguide_preview: '',
			},
			options: {
				external: true,
			},
		} ) );

		await page.waitForTimeout( 3000 );

		await Promise.all( [
			page.waitForResponse( '/wp-admin/admin-ajax.php' ),
			page.locator( '#elementor-panel-header-menu-button' ).click(),
			page.click( 'text=User Preferences' ),
		] );

		const userPreferencesStyleguideSwitcherIsChecked = await page.isChecked( 'input[type=checkbox][data-setting="enable_styleguide_preview"]' );

		await Promise.all( [
			page.waitForResponse( '/wp-admin/admin-ajax.php' ),
			editor.openSiteSettings( ),
		] );

		// Assert.
		expect( userPreferencesStyleguideSwitcherIsChecked ).toBeFalsy();

		// Global Colors.
		// Act.
		await page.click( '.elementor-panel-menu-item-title:has-text("Global Colors")' );

		const siteSettingsColorsStyleguideSwitcherIsChecked = await page.isChecked( 'input[type=checkbox][data-setting="colors_enable_styleguide_preview"]' );
		const styleguidePreviewDialog = editor.getPreviewFrame().locator( '#e-styleguide-preview-dialog' );

		// Assert.
		expect( siteSettingsColorsStyleguideSwitcherIsChecked ).toBeFalsy();
		await expect( styleguidePreviewDialog ).toBeHidden();

		// Global Typography.
		// Act 1.
		await page.locator( '#elementor-panel-header-kit-back' ).click();
		await styleguideSaveChanges( page );

		// Assert 1.
		await expect( styleguidePreviewDialog ).toBeHidden();

		// Act 2.
		await page.click( '.elementor-panel-menu-item-title:has-text("Global Fonts")' );

		const siteSettingsTypographyStyleguideSwitcherIsChecked = await page.isChecked( 'input[type=checkbox][data-setting="typography_enable_styleguide_preview"]' );

		// Assert 2.
		expect( siteSettingsTypographyStyleguideSwitcherIsChecked ).toBeFalsy();
		await expect( styleguidePreviewDialog ).toBeHidden();
	} );

	test( 'Enabling Styleguide Preview at Global Colors shows the Styleguide Modal and updates user preferences', async ( { page }, testInfo ) => {
		// Arrange.
		const { editor } = await getInSettingsTab( page, testInfo, 'Global Colors', false );

		const siteSettingsStyleguideSwitcherBeforeClick = await page.isChecked( 'input[type=checkbox][data-setting="colors_enable_styleguide_preview"]' );
		const styleguidePreviewDialog = editor.getPreviewFrame().locator( '#e-styleguide-preview-dialog' );

		// Assert switcher is off and Styleguide Modal is hidden.
		expect( siteSettingsStyleguideSwitcherBeforeClick ).toBeFalsy();
		await expect( styleguidePreviewDialog ).toBeHidden();
		expect( await isStyleguidePreviewUserPreferencesEnabled( page ) ).toBeFalsy();

		await Promise.all( [
			page.waitForResponse( '/wp-admin/admin-ajax.php' ),
			page.locator( '.elementor-control-title:has-text("Show global settings")' ).click(),
		] );

		const siteSettingsStyleguideSwitcherAfterClick = await page.isChecked( 'input[type=checkbox][data-setting="colors_enable_styleguide_preview"]' );

		// Assert switcher is on and Styleguide Modal is visible.
		expect( siteSettingsStyleguideSwitcherAfterClick ).toBeTruthy();
		await expect( styleguidePreviewDialog ).toBeVisible();
		expect( await isStyleguidePreviewUserPreferencesEnabled( page ) ).toBeTruthy();
	} );

	test( 'Enabling Styleguide Preview at Global Typography shows the Styleguide Modal and updates user preferences', async ( { page }, testInfo ) => {
		// Arrange.
		const { editor } = await getInSettingsTab( page, testInfo, 'Global Fonts', false );

		const siteSettingsStyleguideSwitcherBeforeClick = await page.isChecked( 'input[type=checkbox][data-setting="typography_enable_styleguide_preview"]' );
		const styleguidePreviewDialog = editor.getPreviewFrame().locator( '#e-styleguide-preview-dialog' );

		// Assert switcher is off and Styleguide Modal is hidden.
		expect( siteSettingsStyleguideSwitcherBeforeClick ).toBeFalsy();
		await expect( styleguidePreviewDialog ).toBeHidden();
		expect( await isStyleguidePreviewUserPreferencesEnabled( page ) ).toBeFalsy();

		await Promise.all( [
			page.waitForResponse( '/wp-admin/admin-ajax.php' ),
			page.locator( '.elementor-control-title:has-text("Show global settings")' ).click(),
		] );

		const siteSettingsStyleguideSwitcherAfterClick = await page.isChecked( 'input[type=checkbox][data-setting="typography_enable_styleguide_preview"]' );

		// Assert switcher is on and Styleguide Modal is visible.
		expect( siteSettingsStyleguideSwitcherAfterClick ).toBeTruthy();
		await expect( styleguidePreviewDialog ).toBeVisible();
		expect( await isStyleguidePreviewUserPreferencesEnabled( page ) ).toBeTruthy();
	} );

	test( 'Disabling Styleguide Preview at Global Colors hides the Styleguide Modal and updates user preferences', async ( { page }, testInfo ) => {
		// Arrange.

		const { editor } = await getInSettingsTab( page, testInfo, 'Global Colors', true );
		const siteSettingsStyleguideSwitcherBeforeClick = await page.isChecked( 'input[type=checkbox][data-setting="colors_enable_styleguide_preview"]' );
		const styleguidePreviewDialog = editor.getPreviewFrame().locator( '#e-styleguide-preview-dialog' );

		// Assert switcher is off and Styleguide Modal is hidden.
		expect( siteSettingsStyleguideSwitcherBeforeClick ).toBeTruthy();
		await expect( styleguidePreviewDialog ).toBeVisible();
		expect( await isStyleguidePreviewUserPreferencesEnabled( page ) ).toBeTruthy();

		await Promise.all( [
			page.waitForResponse( '/wp-admin/admin-ajax.php' ),
			page.locator( '.elementor-control-title:has-text("Show global settings")' ).click(),
		] );

		const siteSettingsStyleguideSwitcherAfterClick = await page.isChecked( 'input[type=checkbox][data-setting="colors_enable_styleguide_preview"]' );

		// Assert switcher is on and Styleguide Modal is visible.
		expect( siteSettingsStyleguideSwitcherAfterClick ).toBeFalsy();
		await expect( styleguidePreviewDialog ).toBeHidden();
		expect( await isStyleguidePreviewUserPreferencesEnabled( page ) ).toBeFalsy();
	} );

	test( 'Disabling Styleguide Preview at Global Typography hides the Styleguide Modal and updates user preferences', async ( { page }, testInfo ) => {
		// Arrange.
		const { editor } = await getInSettingsTab( page, testInfo, 'Global Fonts', true );

		const siteSettingsStyleguideSwitcherBeforeClick = await page.isChecked( 'input[type=checkbox][data-setting="typography_enable_styleguide_preview"]' );
		const styleguidePreviewDialog = editor.getPreviewFrame().locator( '#e-styleguide-preview-dialog' );

		// Assert switcher is off and Styleguide Modal is hidden.
		expect( siteSettingsStyleguideSwitcherBeforeClick ).toBeTruthy();
		await expect( styleguidePreviewDialog ).toBeVisible();
		expect( await isStyleguidePreviewUserPreferencesEnabled( page ) ).toBeTruthy();

		await Promise.all( [
			page.waitForResponse( '/wp-admin/admin-ajax.php' ),
			page.locator( '.elementor-control-title:has-text("Show global settings")' ).click(),
		] );

		const siteSettingsStyleguideSwitcherAfterClick = await page.isChecked( 'input[type=checkbox][data-setting="typography_enable_styleguide_preview"]' );

		// Assert switcher is on and Styleguide Modal is visible.
		expect( siteSettingsStyleguideSwitcherAfterClick ).toBeFalsy();
		await expect( styleguidePreviewDialog ).toBeHidden();
		expect( await isStyleguidePreviewUserPreferencesEnabled( page ) ).toBeFalsy();
	} );

	test( 'Clicks on color trigger picker state and active state', async ( { page }, testInfo ) => {
		// Arrange.
		const { editor } = await getInSettingsTab( page, testInfo, 'Global Colors', true );

		const primaryColor = editor.getPreviewFrame().getByText( /Primary#[A-Fa-f0-9]{6}/i );
		const picker = page.locator( '.pcr-button' ).first();

		// Act 1. Click on color in preview.
		await primaryColor.click();

		// Assert 1.
		await expect( primaryColor ).toHaveClass( /active/ );
		expect( await page.getByText( 'Color Picker' ).first().isVisible() ).toBeTruthy();

		// Act 2. click on color again everything should stay the same.
		await primaryColor.click();

		// Assert 2.
		await expect( primaryColor ).toHaveClass( /active/ );
		expect( await page.getByText( 'Color Picker' ).first().isVisible() ).toBeTruthy();

		// Act 3. Click picker after already active.
		await picker.click();

		// Assert 3.
		await expect( primaryColor ).not.toHaveClass( /active/ );
	} );

	test( 'Clicks on font trigger picker state and active state', async ( { page }, testInfo ) => {
		// Arrange.
		const { editor } = await getInSettingsTab( page, testInfo, 'Global Fonts', true );

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

	test( 'Change font title', async ( { page }, testInfo ) => {
		// Arrange.
		const { editor } = await getInSettingsTab( page, testInfo, 'Global Fonts', true );

		const input = page.locator( '.elementor-repeater-fields' ).nth( 2 );

		// Act - Click on font in preview.
		await input.click();
		await input.type( 'more' );

		// Assert
		const TextFont = editor.getPreviewFrame().getByText( 'Textmore' + fontsContentText );
		await expect( TextFont ).toContainText( 'Textmore' );
	} );

	test( 'Change color title', async ( { page }, testInfo ) => {
		// Arrange.
		const { editor } = await getInSettingsTab( page, testInfo, 'Global Colors', true );

		const input = page.locator( '.elementor-repeater-fields' ).nth( 1 );

		// Act - Change title.
		await input.click();
		await input.type( 'more' );

		// Assert
		const secondaryColor = editor.getPreviewFrame().getByText( /Secondarymore#[A-Fa-f0-9]{6}/i );
		await expect( secondaryColor ).toContainText( 'Secondarymore' );
	} );

	test( 'Adding and removing new colors', async ( { page }, testInfo ) => {
		// Arrange.
		const { editor } = await getInSettingsTab( page, testInfo, 'Global Colors', true );

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
		const listItem = page.locator( '.elementor-repeater-fields' ).nth( 4 ).getByText( 'Reorder Remove' );
		const remove = listItem.locator( '.eicon-trash-o' );

		// Act 2 - Click on remove.
		await listItem.hover();
		await remove.click();
		await page.getByRole( 'button', { name: 'Delete' } ).click();

		// Assert 2
		const number = await editor.getPreviewFrame().getByText( /New Item #1#/i ).count();
		expect( number ).toEqual( 0 );
	} );

	test( 'Adding and removing new fonts', async ( { page }, testInfo ) => {
		// Arrange.
		const { editor } = await getInSettingsTab( page, testInfo, 'Global Fonts', true );
		const addButton = page.getByRole( 'button', { name: 'Add Style' } );

		// Act.
		await addButton.click();

		// Assert
		const customFontsCount = await page.locator( '.elementor-control-custom_typography .elementor-repeater-fields' ).count();
		expect( await editor.getPreviewFrame().getByText( 'New Item #' + customFontsCount + fontsContentText ).count() ).toEqual( 1 );

		// Arrange 2.
		const listItem = page.locator( '.elementor-control-custom_typography .elementor-repeater-fields' ).last().getByText( 'Edit Remove Reorder' );
		const remove = listItem.locator( '.eicon-trash-o' );

		// Act 2 - Click on remove.
		await listItem.hover();
		await remove.click();
		await page.getByRole( 'button', { name: 'Delete' } ).click();

		// Assert 2
		const number = await editor.getPreviewFrame().getByText( 'New Item #' + customFontsCount + fontsContentText ).count();
		expect( number ).toEqual( 0 );
	} );

	test( 'Changed color in picker to reflect in styleguide', async ( { page }, testInfo ) => {
		// Arrange.
		const { editor } = await getInSettingsTab( page, testInfo, 'Global Colors', true );
		const secondaryColor = editor.getPreviewFrame().getByText( /Secondary#[A-Fa-f0-9]{6}/i );

		const picker = page.locator( '.elementor-repeater-fields' ).nth( 1 ).locator( '.pcr-button' );
		// Act.
		await picker.click();
		await page.locator( '.pcr-result' ).nth( 1 ).fill( '#594833' );

		// Assert
		await expect( secondaryColor.locator( 'div' ).first() ).toHaveCSS( 'background-color', 'rgb(89, 72, 51)' );
	} );

	test( 'Changed font values in picker to reflect in styleguide', async ( { page }, testInfo ) => {
		// Arrange.
		const { editor } = await getInSettingsTab( page, testInfo, 'Global Fonts', true );

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

	test( 'Switching between tabs makes relevant area visible', async ( { page }, testInfo ) => {
		// Arrange.
		const { editor } = await getInSettingsTab( page, testInfo, 'Global Colors', true );
		await page.waitForTimeout( 2000 );

		await page.locator( '#elementor-panel-header-kit-back' ).click();
		await styleguideSaveChanges( page );
		await page.waitForTimeout( 2000 );

		// Act.
		await page.click( '.elementor-panel-menu-item-title:has-text("Global Fonts")' );

		// Assert
		await expect( editor.getPreviewFrame().getByText( 'Global Fonts' ) ).toBeVisible();

		// Act 2.
		await page.locator( '#elementor-panel-header-kit-back' ).click();
		await styleguideSaveChanges( page );
		await page.waitForTimeout( 2000 );

		await page.click( '.elementor-panel-menu-item-title:has-text("Global Colors")' );

		// Assert 2
		await expect( editor.getPreviewFrame().getByText( 'Global Colors' ) ).toBeVisible();
	} );

	test( 'Clicking header buttons makes relevant area visible', async ( { page }, testInfo ) => {
		// Arrange.
		const { editor } = await getInSettingsTab( page, testInfo, 'Global Colors', true );

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
} );

async function isStyleguidePreviewUserPreferencesEnabled( page ) {
	return await page.evaluate( () => elementor.getPreferences( 'enable_styleguide_preview' ) );
}

async function getInSettingsTab( page, testInfo, tabName, styleguideOpen ) {
	const wpAdmin = new WpAdminPage( page, testInfo );
	const editor = await wpAdmin.openNewPage();
	page.setDefaultTimeout( 10000 );

	await page.evaluate( ( isOpen ) => $e.run( 'document/elements/settings', {
		container: elementor.settings.editorPreferences.getEditedView().getContainer(),
		settings: {
			enable_styleguide_preview: isOpen ? 'yes' : '',
		},
		options: {
			external: true,
		},
	} ), styleguideOpen );

	await page.waitForTimeout( 3000 );

	await Promise.all( [
		page.waitForResponse( '/wp-admin/admin-ajax.php' ),
		editor.openSiteSettings( ),
	] );

	await page.waitForTimeout( 1000 );

	await page.click( `.elementor-panel-menu-item-title:has-text("${ tabName }")` );
	await page.waitForLoadState( 'networkidle' );

	await page.waitForTimeout( 1000 );

	return { editor, wpAdmin };
}

async function styleguideSaveChanges( page ) {
	for ( const dialog of await page.locator( '.dialog-confirm-widget-content' ).all() ) {
		if ( ! await dialog.isVisible( 1000 ) ) {
			continue;
		}

		const dialogHeader = await dialog.locator( '.dialog-header' );
		if ( ! dialogHeader.count() || ! ( await dialogHeader.innerText() ).includes( 'Save Changes' ) ) {
			continue;
		}

		const saveButton = await dialog.locator( '.dialog-button:has-text("Save")' );
		await saveButton.click();
	}
}
