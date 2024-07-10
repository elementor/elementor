import { expect, Page } from '@playwright/test';
import { parallelTest as test } from '../../../parallelTest';
import WpAdminPage from '../../../pages/wp-admin-page';
import { getInSettingsTab } from './styleguide.helper';

test.describe( 'Styleguide Preview tests @styleguide_image_link', () => {
	test.beforeAll( async ( { browser, apiRequests }, testInfo ) => {
		const page = await browser.newPage();
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		await wpAdmin.resetExperiments();

		await page.close();
	} );

	test( 'Enabling Styleguide Preview user preference enabled Styleguide Preview at Global Colors and Global Typography', async ( { page, apiRequests }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
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

		await editor.openUserPreferencesPanel();

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

	test( 'Disabling Styleguide Preview user preference disables Styleguide Preview at Global Colors and Global Typography', async ( { page, apiRequests }, testInfo ) => {
		// Arrange.

		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
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

		await editor.openUserPreferencesPanel();

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

	test( 'Switching between tabs makes relevant area visible', async ( { page, apiRequests }, testInfo ) => {
		// Arrange.
		const { editor } = await getInSettingsTab( page, testInfo, apiRequests, 'Global Colors', true );
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

	test( 'Enabling Styleguide Preview at Global Colors shows the Styleguide Modal and updates user preferences', async ( { page, apiRequests }, testInfo ) => {
		// Arrange.
		const { editor } = await getInSettingsTab( page, testInfo, apiRequests, 'Global Colors', false );

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

	test( 'Enabling Styleguide Preview at Global Typography shows the Styleguide Modal and updates user preferences', async ( { page, apiRequests }, testInfo ) => {
		// Arrange.
		const { editor } = await getInSettingsTab( page, testInfo, apiRequests, 'Global Fonts', false );

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

	test( 'Disabling Styleguide Preview at Global Colors hides the Styleguide Modal and updates user preferences', async ( { page, apiRequests }, testInfo ) => {
		// Arrange.

		const { editor } = await getInSettingsTab( page, testInfo, apiRequests, 'Global Colors', true );
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

	test( 'Disabling Styleguide Preview at Global Typography hides the Styleguide Modal and updates user preferences', async ( { page, apiRequests }, testInfo ) => {
		// Arrange.
		const { editor } = await getInSettingsTab( page, testInfo, apiRequests, 'Global Fonts', true );

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

	test( 'Clicks on color trigger picker state and active state', async ( { page, apiRequests }, testInfo ) => {
		// Arrange.
		const { editor } = await getInSettingsTab( page, testInfo, apiRequests, 'Global Colors', true );

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
} );

async function isStyleguidePreviewUserPreferencesEnabled( page: Page ) {
	return await page.evaluate( () => elementor.getPreferences( 'enable_styleguide_preview' ) );
}

async function styleguideSaveChanges( page: Page ) {
	for ( const dialog of await page.locator( '.dialog-confirm-widget-content' ).all() ) {
		if ( ! await dialog.isVisible() ) {
			continue;
		}

		const dialogHeader = dialog.locator( '.dialog-header' );
		if ( ! await dialogHeader.count() || ! ( await dialogHeader.innerText() ).includes( 'Save Changes' ) ) {
			continue;
		}

		const saveButton = dialog.locator( '.dialog-button:has-text("Save")' );
		await saveButton.click();
	}
}
