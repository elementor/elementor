const { test, expect } = require( '@playwright/test' );
const { onboarding } = require( './onboarding.utils' );
const testData = JSON.parse(JSON.stringify(require('./onboarding.data.json')));


let helper = {};

test.beforeEach(async ({ page }) => {
	helper = new onboarding(page);
});


test.describe('First Step - Elementor Account', () => {

	test( '"Upgrade" CTA Works', async ( { page } ) => {
		await helper.gotoStep1();
		await helper.hoverOverGoProHeaderButton();
		await helper.checkGoProPopoverIsVisible();
		await helper.checkUpgradeFeatureListIsCorrect(testData.upgradeFeaturesList);
		
		const [ proPage ] = await Promise.all( [
			page.waitForEvent( 'popup' ),

			helper.selectUpgradeNowButton(),
		] );
		
		await helper.checkUserIsOnProPage(proPage);
	});


	test( '"Already Have Elementor Pro" link on popover works', async ( { page } ) => {
		await helper.gotoStep1();
		await helper.hoverOverGoProHeaderButton();
		
		const [ importPopup ] = await Promise.all( [
			page.waitForEvent( 'popup' ),
			helper.selectAlreadyHaveElementorProLink(),
		] );

		await expect(await importPopup.url()).toContain('uploadAndInstallPro');
	});


	test( '"Connect Your Account" link works', async ( { page } ) => {
		await helper.gotoStep1();
		
		const [ signIntoElementorPopup ] = await Promise.all( [
			page.waitForEvent( 'popup' ),
			helper.selectConnectYourAccountLink(),
		] );
		
		await expect(await signIntoElementorPopup.url()).toContain(helper.loginURL);
	});


	test( 'User can close the onboarding process', async ( { page } ) => {
		await helper.gotoStep1();
		await helper.selectCloseOnboardingButton();
		await helper.checkUserIsOnWpAdminPage();
	});


	test( 'Progress Bar: Only first step is filled', async ( { page } ) => {
		await helper.gotoStep1();
		await helper.checkCurrentStepIsFilled(1);
		await helper.checkIconsNotSupposedToBeFilled(1);
	});


	test( '"Create my account" Popup Open', async ( { page } ) => {
		await helper.gotoStep1();
	
		await helper.checkButtonHasCorrectName(helper.createMyAccountButton, testData.createAccountButtonText);
	
		const [ createAccountPopUp ] = await Promise.all( [
			// It is important to call waitForEvent before click to set up waiting.
			page.waitForEvent( 'popup' ),
			// Opens popup.
			helper.selectCreateMyAccountCTA(),
		] );
	
		await helper.checkCreateAccountPopupTitleIsVisible(createAccountPopUp);
		
		await createAccountPopUp.close();
	});


	test( '"Create Account" in the header Popup Open', async ( { page } ) => {
		await helper.gotoStep1();
		
		const [ createAccountPopUp ] = await Promise.all( [
			// It is important to call waitForEvent before click to set up waiting.
			page.waitForEvent( 'popup' ),
			// Opens popup.
			helper.selectHeaderCreateAccountCTA(),
		] );
	
		await helper.checkCreateAccountPopupTitleIsVisible(createAccountPopUp);
		
		await createAccountPopUp.close();
	});

	
	test( 'Skip to Hello Theme Page', async ( { page } ) => {
		await helper.gotoStep1();
		await helper.selectSkipButton();
		await helper.checkUserIsOnStepTwo();
	});
});







test.describe.only('Second Step - Hello Theme', () => {
	test( '"Continue with Hello Theme" button works', async ( { page } ) => {
		await helper.gotoStep2();
		await helper.selectContinueWithHelloThemeButton();
		await helper.checkUserIsOnStepThree();
		await helper.gotoThemesPage();
		await helper.checkElementorThemeIsActive();
		await helper.activateTwenty21Theme();
	});


	test( 'Validated notice is present and skip works', async ( { page } ) => {
		await helper.gotoStep2();
		await helper.checkDisclaimerIsPresent(testData.disclaimerNotice);
		await helper.selectSkipButton();
		await helper.checkUserIsOnStepThree();
	});


	test( 'Progress Bar: Second step is filled and 3,4,5 are not', async ( { page } ) => {
		await helper.gotoStep2();
		await helper.checkCurrentStepIsFilled(2);
		await helper.checkIconsNotSupposedToBeFilled(2);
	});
});

/**
 * Test the Site Name page
 *
 * 1. The 'Next' button should be disabled if the site name input is empty, and become enabled again when a text is
 * filled.
 * 2. Clicking on 'Skip' should take the user to the Site Logo screen
 */
test( 'Onboarding Site Name Page', async ( { page } ) => {
	await helper.gotoStep3();

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
