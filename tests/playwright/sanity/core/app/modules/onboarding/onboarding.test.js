const { test, expect } = require( '@playwright/test' );
const WpAdminPage = require( '../../../../../pages/wp-admin-page' );

test.describe( 'On boarding', async () => {
	let originalActiveTheme;
	test.beforeAll( async ( { browser }, testInfo ) => {
		const context = await browser.newContext();
		const page = await context.newPage();
		const wpAdmin = new WpAdminPage( page, testInfo );
		originalActiveTheme = wpAdmin.getActiveTheme();
		wpAdmin.activateTheme( 'twentytwentytwo' );
	} );

	test.afterAll( async ( { browser }, testInfo ) => {
		const context = await browser.newContext();
		const page = await context.newPage();
		const wpAdmin = new WpAdminPage( page, testInfo );
		wpAdmin.activateTheme( originalActiveTheme );
	} );

	/**
	 *  Test that the "Upgrade" popover appears when overing over the "Upgrade" button.
	 */
	test( 'Onboarding Upgrade Popover', async ( { page } ) => {
		await page.goto( '/wp-admin/admin.php?page=elementor-app#onboarding' );

		const goProHeaderButton = await page.locator( '#eps-app-header-btn-go-pro' );

		await goProHeaderButton.hover();

		const goProPopover = await page.locator( '.e-app__popover.e-onboarding__go-pro' );

		await expect( goProPopover ).toBeVisible();
	} );

	/**
	 * Test the first onboarding page - Test that the Action button at the bottom shows the correct "Create my account"
	 * text, And that clicking on it opens the popup to create an account in my.elementor.com
	 */
	test( 'Onboarding Create Account Popup Open', async ( { page } ) => {
		await page.goto( '/wp-admin/admin.php?page=elementor-app#onboarding' );

		const ctaButton = await page.waitForSelector( 'a.e-onboarding__button-action' );

		await expect( await ctaButton.innerText() ).toBe( 'Create my account' );

		const [ popup ] = await Promise.all( [
			// It is important to call waitForEvent before click to set up waiting.
			page.waitForEvent( 'popup' ),
			// Opens popup.
			page.click( 'a.e-onboarding__button-action' ),
		] );

		await popup.waitForLoadState( 'domcontentloaded' );

		await expect( await popup.url() ).toContain( 'my.elementor.com/signup' );

		const signupForm = await popup.locator( 'form#signup-form' );

		// Check that the popup opens the Elementor Connect screen.
		await expect( signupForm ).toBeVisible();

		popup.close();
	} );

	/**
	 * Test the "Skip" button - to make sure it skips to the next step.
	 */
	test( 'Onboarding Skip to Hello Theme Page', async ( { page } ) => {
		await page.goto( '/wp-admin/admin.php?page=elementor-app#onboarding' );
		await page.waitForLoadState( 'networkidle' );

		const skipButton = await page.waitForSelector( 'text=Skip' );

		await skipButton.click();

		const PageTitle = await page.waitForSelector( '.e-onboarding__page-content-section-title' ),
			pageTitleText = await PageTitle.innerText();

		// Check that the screen changed to the Hello page.
		expect( pageTitleText ).toBe( 'Every site starts with a theme.' );
	} );

	/**
	 * Test the Site Name page
	 *
	 * 1. The 'Next' button should be disabled if the site name input is empty, and become enabled again when a text is
	 * filled.
	 * 2. Clicking on 'Skip' should take the user to the Site Logo screen
	 */
	test( 'Onboarding Site Name Page', async ( { page } ) => {
		await page.goto( '/wp-admin/admin.php?page=elementor-app#onboarding/siteName' );

		await page.fill( 'input[type="text"]', '' );

		const nextButton = await page.locator( 'text=Next' );

		await expect( nextButton ).toHaveClass( 'e-onboarding__button--disabled e-onboarding__button e-onboarding__button-action' );

		await page.fill( 'input[type="text"]', 'Test' );

		await expect( nextButton ).toHaveClass( 'e-onboarding__button e-onboarding__button-action' );

		const skipButton = await page.waitForSelector( 'text=Skip' );

		await skipButton.click();

		const pageTitle = await page.locator( '.e-onboarding__page-content-section-title' ),
			pageTitleText = await pageTitle.innerText();

		await expect( pageTitleText ).toBe( 'Have a logo? Add it here.' );
	} );

	/**
	 * Test the Site Logo page
	 *
	 * 1. The 'Next' button should be disabled if there is no image selected, and become enabled again when an image is
	 * selected.
	 * 2. Clicking on 'Skip' should take the user to the Good to Go screen
	 */
	test( 'Onboarding Site Logo Page', async ( { page } ) => {
		await page.goto( '/wp-admin/admin.php?page=elementor-app#onboarding/siteLogo' );

		const nextButton = await page.locator( 'text=Next' ),
			activeButtonClasses = 'e-onboarding__button e-onboarding__button-action',
			disabledButtonClasses = 'e-onboarding__button--disabled e-onboarding__button e-onboarding__button-action',
			siteLogoId = await page.evaluate( () => elementorAppConfig.onboarding.siteLogo.id );

		if ( siteLogoId ) {
			// If there is a logo already in the test website - make sure the "Next" button is active (not disabled).
			await expect( nextButton ).toHaveClass( activeButtonClasses );

			const removeButton = await page.locator( '.e-onboarding__logo-remove' );

			await removeButton.click();
		}

		// Make sure the "Next" button is disabled when there is no site logo.
		await expect( nextButton ).toHaveClass( disabledButtonClasses );

		const skipButton = await page.waitForSelector( '.e-onboarding__button-skip' );

		await skipButton.click();

		const pageTitle = await page.locator( '.e-onboarding__page-content-section-title' ),
			pageTitleText = await pageTitle.innerText();

		// Test that the "Skip" button leads the user to the "Good to Go" screen.
		await expect( pageTitleText ).toBe( 'That\'s a wrap! What\'s next?' );
	} );

	/**
	 * In the Good to Go page - tests that clicking on the Kit Library card/button navigates the user to the Kit Library.
	 */
	test( 'Onboarding Good to Go Page - Open Kit Library', async ( { page } ) => {
		await page.goto( '/wp-admin/admin.php?page=elementor-app#onboarding/goodToGo' );

		const nextButton = await page.locator( '.e-onboarding__cards-grid > a:nth-child(2)' );

		await nextButton.click();

		const kitLibraryTitle = await page.locator( 'text=Kit Library' );

		await expect( kitLibraryTitle ).toBeVisible();
	} );
} );
