const { test, expect, chromium } = require( '@playwright/test' );
const { createPage, deletePage } = require( '../../../utilities/rest-api' );
const WpAdminPage = require( '../../../pages/wp-admin-page' );
const { pause } = require( "../../../../../../../../wp-includes/js/codemirror/csslint" );

test.describe( 'Styleguide Preview tests @styleguide', () => {
	let pageId;

	test.beforeAll( async ( { browser }, testInfo ) => {
		const page = await browser.newPage();
		const wpAdmin = new WpAdminPage( page, testInfo );
		await wpAdmin.setExperiments( { e_global_styleguide: true } );
		await page.close();
	} );

	test.beforeEach( async ( { page }, testInfo ) => {
		pageId = await createPage();
	} );

	// TODO 09/03/2023 : experiment!

	test.afterEach( async ( { page }, testInfo ) => {
		await deletePage( pageId );
	} );

	test.afterAll( async ( { browser }, testInfo ) => {
		const page = await browser.newPage();
		const wpAdmin = new WpAdminPage( page, testInfo );
		await wpAdmin.setExperiments( { e_global_styleguide: false } );
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
		const styleguidePreviewDialog = editor.getPreviewFrame().locator( '#e-styleguide-preview-dialog' );

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
		const styleguidePreviewDialog = editor.getPreviewFrame().locator( '#e-styleguide-preview-dialog' );

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
		const { editor } = await getInSettingsTab( page, testInfo, 'Global Colors', false );

		const siteSettingsStyleguideSwitcherBeforeClick = await page.isChecked( 'input[type=checkbox][data-setting="colors_enable_styleguide_preview"]' );
		const styleguidePreviewDialog = editor.getPreviewFrame().locator( '#e-styleguide-preview-dialog' );

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
		const { editor } = await getInSettingsTab( page, testInfo, 'Global Fonts', false );

		const siteSettingsStyleguideSwitcherBeforeClick = await page.isChecked( 'input[type=checkbox][data-setting="typography_enable_styleguide_preview"]' );
		const styleguidePreviewDialog = editor.getPreviewFrame().locator( '#e-styleguide-preview-dialog' );

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

		const { editor } = await getInSettingsTab( page, testInfo, 'Global Colors', true );

		const siteSettingsStyleguideSwitcherBeforeClick = await page.isChecked( 'input[type=checkbox][data-setting="colors_enable_styleguide_preview"]' );
		const styleguidePreviewDialog = editor.getPreviewFrame().locator( '#e-styleguide-preview-dialog' );

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
		const { editor } = await getInSettingsTab( page, testInfo, 'Global Fonts', true );

		const siteSettingsStyleguideSwitcherBeforeClick = await page.isChecked( 'input[type=checkbox][data-setting="typography_enable_styleguide_preview"]' );
		const styleguidePreviewDialog = editor.getPreviewFrame().locator( '#e-styleguide-preview-dialog' );

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

	test( 'Clicks on color trigger picker state and active state', async ( { page }, testInfo ) => {
		// Arrange.
		const { editor } = await getInSettingsTab( page, testInfo, 'Global Colors', true );

		const primaryColor = editor.getPreviewFrame().getByText( /Primary#[A-Fa-f0-9]{6}/i );
		const picker = await page.locator( '.pcr-button' ).first();

		//Act 1. Click on color in preview.
		await primaryColor.click();

		// Assert 1.
		await expect( primaryColor ).toHaveClass( /active/ );
		await expect( await page.isVisible( 'text=Color Picker' ) ).toBeTruthy();

		// Act 2. click on color again to close the picker.
		await primaryColor.click();

		// Assert 2.
		await expect( await page.isVisible( 'text=Color Picker' ) ).toBeFalsy();
		await expect( primaryColor ).not.toHaveClass( /active/ );

		// Act 3. Click picker.
		await picker.click();

		// Assert 3.
		await expect( primaryColor ).toHaveClass( /active/ );

		// Act 4. Click picker again.
		await picker.click();

		// Assert 4.
		await expect( primaryColor ).not.toHaveClass( /active/ );

		// Arrange 5.
		await primaryColor.click();

		// Act 5. Click picker after already active.
		await picker.click();

		// Assert 5.
		await expect( primaryColor ).not.toHaveClass( /active/ );

	} );

	test( 'Clicks on font trigger picker state and active state', async ( { page }, testInfo ) => {
		// Arrange.
		const { editor } = await getInSettingsTab( page, testInfo, 'Global Fonts', true );

		const secondaryFont = editor.getPreviewFrame().getByText( 'Secondary the five boxing wizards jump quickly' );
		const picker = await page.locator( '.elementor-control-popover-toggle-toggle-label' ).first();

		//Act 1. Click on font in preview.
		await secondaryFont.click();

		// Assert 1.
		await expect( secondaryFont ).toHaveClass( /active/ );
		await expect( await page.isVisible( 'text=Typography' ) ).toBeTruthy();

		// Act 2. click on font again to close the picker.
		await secondaryFont.click();

		// Assert 2.
		await expect( await page.isVisible( 'text=Typography' ) ).toBeFalsy();
		await expect( secondaryFont ).not.toHaveClass( /active/ );

		// Act 3. Click picker.
		await picker.click();

		// Assert 3.
		await expect( secondaryFont ).toHaveClass( /active/ );

		// Act 4. Click picker again.
		await picker.click();

		// Assert 4.
		await expect( secondaryFont ).not.toHaveClass( /active/ );

		// Arrange 5.
		await secondaryFont.click();

		// Act 5. Click picker after already active.
		await picker.click();

		// Assert 5.
		await expect( secondaryFont ).not.toHaveClass( /active/ );

	} );

	test( 'Change font title', async ( { page }, testInfo ) => {
		// Arrange.
		const { editor } = await getInSettingsTab( page, testInfo, 'Global Fonts', true );

		const accentFont = editor.getPreviewFrame().getByText( 'Accent the five boxing wizards jump quickly' );
		const input = await page.locator( '.elementor-repeater-fields' ).nth( 1 );

		//Act - Click on font in preview.
		await input.click();
		await input.type( 'more' );

		// Assert
		await expect( accentFont ).toHaveText( 'Accentmore' );

	} );

	test( 'Change color title', async ( { page }, testInfo ) => {
		// Arrange.
		const { editor } = await getInSettingsTab( page, testInfo, 'Global Colors', true );

		// const input = await page.getByRole( 'textbox', { name: 'Secondary' } );
		const secondaryColor = editor.getPreviewFrame().getByText( /Secondary#[A-Fa-f0-9]{6}/i );
		const input = await page.locator( '.elementor-repeater-fields' ).nth( 1 );

		//Act - Change title.
		await input.click();
		await input.type( 'more' );
		// Assert
		await expect( secondaryColor ).toHaveText( 'Secondarymore' );
	} );

	test( 'Adding and removing new colors', async ( { page }, testInfo ) => {
		// Arrange.
		const { editor } = await getInSettingsTab( page, testInfo, 'Global Colors', true );

		const addButton = await page.getByRole( 'button', { name: 'Add Color' } );

		//Act - Click on add title.
		await addButton.click();

		// Assert
		await expect( editor.getPreviewFrame().getByText( /New Item #1#/i ) ).toBeTruthy();

		// Arrange 2.
		const listItem = await page.locator( '.elementor-repeater-fields' ).nth( 4 ).getByText( 'Reorder Remove' );
		const remove = await listItem.locator( '.eicon-trash-o' );
		//Act 2 - Click on remove.

		await listItem.hover();
		await remove.click();
		await page.getByRole( 'button', { name: 'Delete' } ).click();

		// Assert 2
		await expect( editor.getPreviewFrame().getByText( /New Item #1#/i ) ).toBeFalsy();
	} );

	test( 'Changed color in picker to reflect in styleguide', async ( { page }, testInfo ) => {
		// Arrange.
		const { editor } = await getInSettingsTab( page, testInfo, 'Global Colors', true );

		const secondaryColor = editor.getPreviewFrame().getByText( /Secondary#[A-Fa-f0-9]{6}/i );
		const picker = await page.locator( '.elementor-repeater-fields' ).nth( 1 ).locator( '.pcr-button' );
		//Act.
		await picker.click();
		await page.locator( '.pcr-result' ).nth( 1 ).fill( '#594833' );

		// Assert
		await expect( secondaryColor.locator( 'div' ).first() ).toHaveCSS( 'background-color', 'rgb(89, 72, 51)' );
	} );

	test( 'Changed font values in picker to reflect in styleguide', async ( { page }, testInfo ) => {
		// Arrange.
		const { editor } = await getInSettingsTab( page, testInfo, 'Global Fonts', true );

		const textFont = editor.getPreviewFrame().getByText( 'Text the five boxing wizards jump quickly' );
		const picker = await page.locator( '.elementor-repeater-fields' ).nth( 2 ).locator( '.eicon-edit' ).first();

		//Act.
		await picker.click();
		const select = await page.locator( '.elementor-repeater-fields' ).nth( 2 ).getByRole( 'combobox', { name: 'Style' } );
		await select.selectOption( { label: 'Italic' } );
		const select2 = await page.locator( '.elementor-repeater-fields' ).nth( 2 ).getByRole( 'combobox', { name: 'Decoration' } );
		await select2.selectOption( { label: 'Underline' } );

		// Assert
		const typographyDiv = textFont.locator( 'div' ).first();
		await expect( typographyDiv ).toHaveCSS( 'font-style', 'italic' );
		await expect( typographyDiv ).toHaveCSS( 'text-decoration', 'underline' );
	} );

	test( 'Switching between tabs makes relevant area visible', async ( { page }, testInfo ) => {
		// Arrange.
		const { editor } = await getInSettingsTab( page, testInfo, 'Global Colors', true );

		//Act.
		await page.click( 'text=Global Fonts' );

		// Assert
		await expect( editor.getPreviewFrame().getByText( 'Global Fonts' ) ).toBeVisible();

		//Act 2.
		await page.click( 'text=Global Colors' );

		// Assert 2
		await expect( editor.getPreviewFrame().getByText( 'Global Colors' ) ).toBeVisible();
	} );

	test.only( 'Clicking header buttons makes relevant area visible', async ( { page }, testInfo ) => {
		// Arrange.
		const { editor } = await getInSettingsTab( page, testInfo, 'Global Colors', true );
		const fontsButton = await editor.getPreviewFrame().getByRole( 'button', { name: 'Fonts' } );
		const colorButton = await editor.getPreviewFrame().getByRole( 'button', { name: 'Colors' } );

		//Act.
		await page.pause();
		await fontsButton.click();

		// Assert
		await expect( editor.getPreviewFrame().getByText( 'Global Fonts' ) ).toBeVisible();

		//Act 2.
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
	const editor = await wpAdmin.useElementorCleanPost();
	page.setDefaultTimeout( 10000 );

	await page.evaluate( ( styleguideOpen ) => $e.run( 'document/elements/settings', {
		container: elementor.settings.editorPreferences.getEditedView().getContainer(),
		settings: {
			enable_styleguide_preview: styleguideOpen ? 1 : 0,
		},
		options: {
			external: true,
		},
	} ), styleguideOpen );

	await Promise.all( [
		page.waitForResponse( '/wp-admin/admin-ajax.php' ),
		wpAdmin.openSiteSettings( false ),
	] );

	await page.waitForTimeout( 1000 );

	await page.click( `text=${ tabName }` );
	await page.waitForLoadState( 'networkidle' );

	return { editor, wpAdmin };
}