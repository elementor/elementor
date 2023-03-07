const { test, expect } = require( '@playwright/test' );
const { createPage, deletePage } = require( '../../../utilities/rest-api' );
const WpAdminPage = require( '../../../pages/wp-admin-page' );

test.describe( 'Styleguide Preview tests @styleguide', () => {
	let pageId;

	test.beforeEach( async () => {
		pageId = await createPage();
	} );

	test.afterEach( async () => {
		await deletePage( pageId );
	} );

	test( 'Enabling Styleguide Preview user preference enabled Styleguide Preview at Global Colors and Global Typography', async ( { page }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo );
		const editor = await wpAdmin.useElementorCleanPost();
		page.setDefaultTimeout( 20000 );

		await page.evaluate( () => $e.run( 'document/elements/settings', {
			container: elementor.settings.editorPreferences.getEditedView().getContainer(),
			settings: {
				enable_styleguide_preview: 0,
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
			page.click( 'text=Style Guide Preview' ),
		] );

		const userPreferencesStyleguideSwitcherAfterClick = await page.isChecked( userPreferencesStyleguideSwitcherSelector );

		await Promise.all( [
			page.waitForResponse( '/wp-admin/admin-ajax.php' ),
			wpAdmin.openSiteSettings( false ),
		] );

		// Assert.
		await expect( userPreferencesStyleguideSwitcherBeforeClick ).toBeFalsy();
		await expect( userPreferencesStyleguideSwitcherAfterClick ).toBeTruthy();

		// Global Colors.
		// Act.
		await page.click( 'text=Global Colors' );
		await page.waitForTimeout( 3000 );
		await page.waitForLoadState( 'networkidle' );

		const siteSettingsColorsStyleguideSwitcherIsChecked = await page.isChecked( 'input[type=checkbox][data-setting="colors_enable_styleguide_preview"]' );
		const styleguidePreviewDialog = editor.getPreviewFrame().locator( '#e-styleguide-preview' );

		// Assert.
		await expect( siteSettingsColorsStyleguideSwitcherIsChecked ).toBeTruthy();
		await expect( styleguidePreviewDialog ).toBeVisible();

		// Global Typography.
		// Act 1.
		await page.locator( '#elementor-panel-header-kit-back' ).click();
		await page.waitForLoadState( 'networkidle' );

		// Assert 1.
		await expect( styleguidePreviewDialog ).toBeHidden();

		// Act 2.
		await page.click( 'text=Global Fonts' );
		await page.waitForTimeout( 3000 );
		await page.waitForLoadState( 'networkidle' );

		const siteSettingsTypographyStyleguideSwitcherIsChecked = await page.isChecked( 'input[type=checkbox][data-setting="typography_enable_styleguide_preview"]' );

		// Assert 2.
		await expect( siteSettingsTypographyStyleguideSwitcherIsChecked ).toBeTruthy();
		await expect( styleguidePreviewDialog ).toBeVisible();
	} );

	test( 'Disabling Styleguide Preview user preference disables Styleguide Preview at Global Colors and Global Typography', async ( { page }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo );
		const editor = await wpAdmin.useElementorCleanPost();
		page.setDefaultTimeout( 20000 );

		await page.evaluate( () => $e.run( 'document/elements/settings', {
			container: elementor.settings.editorPreferences.getEditedView().getContainer(),
			settings: {
				enable_styleguide_preview: 0,
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
			wpAdmin.openSiteSettings( false ),
		] );

		// Assert.
		await expect( userPreferencesStyleguideSwitcherIsChecked ).toBeFalsy();

		// Global Colors.
		// Act.
		await page.click( 'text=Global Colors' );
		await page.waitForTimeout( 3000 );
		await page.waitForLoadState( 'networkidle' );

		const siteSettingsColorsStyleguideSwitcherIsChecked = await page.isChecked( 'input[type=checkbox][data-setting="colors_enable_styleguide_preview"]' );
		const styleguidePreviewDialog = editor.getPreviewFrame().locator( '#e-styleguide-preview' );

		// Assert.
		await expect( siteSettingsColorsStyleguideSwitcherIsChecked ).toBeFalsy();
		await expect( styleguidePreviewDialog ).toBeHidden();

		// Global Typography.
		// Act 1.
		await page.locator( '#elementor-panel-header-kit-back' ).click();
		await page.waitForLoadState( 'networkidle' );

		// Assert 1.
		await expect( styleguidePreviewDialog ).toBeHidden();

		// Act 2.
		await page.click( 'text=Global Fonts' );
		await page.waitForTimeout( 3000 );
		await page.waitForLoadState( 'networkidle' );

		const siteSettingsTypographyStyleguideSwitcherIsChecked = await page.isChecked( 'input[type=checkbox][data-setting="typography_enable_styleguide_preview"]' );

		// Assert 2.
		await expect( siteSettingsTypographyStyleguideSwitcherIsChecked ).toBeFalsy();
		await expect( styleguidePreviewDialog ).toBeHidden();
	} );

	test( 'Enabling Styleguide Preview at Global Colors shows the Styleguide Modal and updates user preferences', async ( { page }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo );
		const editor = await wpAdmin.useElementorCleanPost();
		page.setDefaultTimeout( 20000 );

		await page.evaluate( () => $e.run( 'document/elements/settings', {
			container: elementor.settings.editorPreferences.getEditedView().getContainer(),
			settings: {
				enable_styleguide_preview: 0,
			},
			options: {
				external: true,
			},
		} ) );

		await page.waitForTimeout( 3000 );

		await Promise.all( [
			page.waitForResponse( '/wp-admin/admin-ajax.php' ),
			wpAdmin.openSiteSettings( false ),
		] );

		await page.waitForTimeout( 3000 );

		await page.click( 'text=Global Colors' );
		await page.waitForLoadState( 'networkidle' );

		const siteSettingsStyleguideSwitcherBeforeClick = await page.isChecked( 'input[type=checkbox][data-setting="colors_enable_styleguide_preview"]' );
		const styleguidePreviewDialog = editor.getPreviewFrame().locator( '#e-styleguide-preview' );

		// Assert switcher is off and Styleguide Modal is hidden.
		await expect( siteSettingsStyleguideSwitcherBeforeClick ).toBeFalsy();
		await expect( styleguidePreviewDialog ).toBeHidden();
		await expect( await isStyleguidePreviewUserPreferencesEnabled( page ) ).toBeFalsy();

		await Promise.all( [
			page.waitForResponse( '/wp-admin/admin-ajax.php' ),
			page.locator( 'text=Style Guide Preview' ).click(),
		] );

		const siteSettingsStyleguideSwitcherAfterClick = await page.isChecked( 'input[type=checkbox][data-setting="colors_enable_styleguide_preview"]' );

		// Assert switcher is on and Styleguide Modal is visible.
		await expect( siteSettingsStyleguideSwitcherAfterClick ).toBeTruthy();
		await expect( styleguidePreviewDialog ).toBeVisible();
		await expect( await isStyleguidePreviewUserPreferencesEnabled( page ) ).toBeTruthy();
	} );

	test( 'Enabling Styleguide Preview at Global Typography shows the Styleguide Modal and updates user preferences', async ( { page }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo );
		const editor = await wpAdmin.useElementorCleanPost();
		page.setDefaultTimeout( 20000 );

		await page.evaluate( () => $e.run( 'document/elements/settings', {
			container: elementor.settings.editorPreferences.getEditedView().getContainer(),
			settings: {
				enable_styleguide_preview: 0,
			},
			options: {
				external: true,
			},
		} ) );

		await page.waitForTimeout( 3000 );

		await Promise.all( [
			page.waitForResponse( '/wp-admin/admin-ajax.php' ),
			wpAdmin.openSiteSettings( false ),
		] );

		await page.waitForTimeout( 3000 );

		await page.click( 'text=Global Fonts' );
		await page.waitForLoadState( 'networkidle' );

		const siteSettingsStyleguideSwitcherBeforeClick = await page.isChecked( 'input[type=checkbox][data-setting="typography_enable_styleguide_preview"]' );
		const styleguidePreviewDialog = editor.getPreviewFrame().locator( '#e-styleguide-preview' );

		// Assert switcher is off and Styleguide Modal is hidden.
		await expect( siteSettingsStyleguideSwitcherBeforeClick ).toBeFalsy();
		await expect( styleguidePreviewDialog ).toBeHidden();
		await expect( await isStyleguidePreviewUserPreferencesEnabled( page ) ).toBeFalsy();

		await Promise.all( [
			page.waitForResponse( '/wp-admin/admin-ajax.php' ),
			page.locator( 'text=Style Guide Preview' ).click(),
		] );

		const siteSettingsStyleguideSwitcherAfterClick = await page.isChecked( 'input[type=checkbox][data-setting="typography_enable_styleguide_preview"]' );

		// Assert switcher is on and Styleguide Modal is visible.
		await expect( siteSettingsStyleguideSwitcherAfterClick ).toBeTruthy();
		await expect( styleguidePreviewDialog ).toBeVisible();
		await expect( await isStyleguidePreviewUserPreferencesEnabled( page ) ).toBeTruthy();
	} );

	test( 'Disabling Styleguide Preview at Global Colors hides the Styleguide Modal and updates user preferences', async ( { page }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo );
		const editor = await wpAdmin.useElementorCleanPost();
		page.setDefaultTimeout( 20000 );

		await page.evaluate( () => $e.run( 'document/elements/settings', {
			container: elementor.settings.editorPreferences.getEditedView().getContainer(),
			settings: {
				enable_styleguide_preview: 1,
			},
			options: {
				external: true,
			},
		} ) );

		await page.waitForTimeout( 3000 );

		await Promise.all( [
			page.waitForResponse( '/wp-admin/admin-ajax.php' ),
			wpAdmin.openSiteSettings( false ),
		] );

		await page.waitForTimeout( 3000 );

		await page.click( 'text=Global Colors' );
		await page.waitForLoadState( 'networkidle' );

		const siteSettingsStyleguideSwitcherBeforeClick = await page.isChecked( 'input[type=checkbox][data-setting="colors_enable_styleguide_preview"]' );
		const styleguidePreviewDialog = editor.getPreviewFrame().locator( '#e-styleguide-preview' );

		// Assert switcher is off and Styleguide Modal is hidden.
		await expect( siteSettingsStyleguideSwitcherBeforeClick ).toBeTruthy();
		await expect( styleguidePreviewDialog ).toBeVisible();
		await expect( await isStyleguidePreviewUserPreferencesEnabled( page ) ).toBeTruthy();

		await Promise.all( [
			page.waitForResponse( '/wp-admin/admin-ajax.php' ),
			page.locator( 'text=Style Guide Preview' ).click(),
		] );

		const siteSettingsStyleguideSwitcherAfterClick = await page.isChecked( 'input[type=checkbox][data-setting="colors_enable_styleguide_preview"]' );

		// Assert switcher is on and Styleguide Modal is visible.
		await expect( siteSettingsStyleguideSwitcherAfterClick ).toBeFalsy();
		await expect( styleguidePreviewDialog ).toBeHidden();
		await expect( await isStyleguidePreviewUserPreferencesEnabled( page ) ).toBeFalsy();
	} );

	test( 'Disabling Styleguide Preview at Global Typography hides the Styleguide Modal and updates user preferences', async ( { page }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo );
		const editor = await wpAdmin.useElementorCleanPost();
		page.setDefaultTimeout( 20000 );

		await page.evaluate( () => $e.run( 'document/elements/settings', {
			container: elementor.settings.editorPreferences.getEditedView().getContainer(),
			settings: {
				enable_styleguide_preview: 1,
			},
			options: {
				external: true,
			},
		} ) );

		await page.waitForTimeout( 3000 );

		await Promise.all( [
			page.waitForResponse( '/wp-admin/admin-ajax.php' ),
			wpAdmin.openSiteSettings( false ),
		] );

		await page.waitForTimeout( 3000 );

		await page.click( 'text=Global Fonts' );
		await page.waitForLoadState( 'networkidle' );

		const siteSettingsStyleguideSwitcherBeforeClick = await page.isChecked( 'input[type=checkbox][data-setting="typography_enable_styleguide_preview"]' );
		const styleguidePreviewDialog = editor.getPreviewFrame().locator( '#e-styleguide-preview' );

		// Assert switcher is off and Styleguide Modal is hidden.
		await expect( siteSettingsStyleguideSwitcherBeforeClick ).toBeTruthy();
		await expect( styleguidePreviewDialog ).toBeVisible();
		await expect( await isStyleguidePreviewUserPreferencesEnabled( page ) ).toBeTruthy();

		await Promise.all( [
			page.waitForResponse( '/wp-admin/admin-ajax.php' ),
			page.locator( 'text=Style Guide Preview' ).click(),
		] );

		const siteSettingsStyleguideSwitcherAfterClick = await page.isChecked( 'input[type=checkbox][data-setting="typography_enable_styleguide_preview"]' );

		// Assert switcher is on and Styleguide Modal is visible.
		await expect( siteSettingsStyleguideSwitcherAfterClick ).toBeFalsy();
		await expect( styleguidePreviewDialog ).toBeHidden();
		await expect( await isStyleguidePreviewUserPreferencesEnabled( page ) ).toBeFalsy();
	} );
} );

async function isStyleguidePreviewUserPreferencesEnabled( page ) {
	return await page.evaluate( () => elementor.getPreferences( 'enable_styleguide_preview' ) );
}
