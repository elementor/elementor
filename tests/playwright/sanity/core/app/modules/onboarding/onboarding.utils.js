const { expect } = require( '@playwright/test' );

class onboarding {
    constructor( page, baseURL ) {
        this.page = page;
        this.baseUrl = baseURL.replace( /\/+$/, '' );
        this.wpAdminPage = '/wp-admin/';
        this.loginURL = 'https://my.elementor.com/login/';
        this.WpGeneralSettingsPage = '/wp-admin/options-general.php';
        this.customizePage = '/wp-admin/customize.php';
        this.logoRemoveButton = this.page.locator( '.button.remove-button' );
        this.addLogoButtonSelector = '#customize-control-custom_logo .upload-button.button-add-media';
        this.flexBoxStatus = '';

        // On all Steps
        this.closeOnboardingButton = this.page.locator( '.eps-icon.eicon-close' );
        this.headerCreateAccountButton = this.page.locator( '#eps-app-header-btn-create-account' );
        this.alreadyHaveElementorProLink = this.page.locator( '.e-onboarding__go-pro-already-have' );

        // Step 1 - Elementor Account Step
        this.step1URL = '/wp-admin/admin.php?page=elementor-app#onboarding';
        this.upgradeHeaderButton = this.page.locator( '#eps-app-header-btn-go-pro' );
        this.goProPopover = this.page.locator( '.e-app__popover.e-onboarding__go-pro' );
        this.upgradeNowButton = this.page.locator( '[text="Upgrade Now"]' );
        this.createMyAccountButton = this.page.locator( '[text="Create my account"]' );
        this.skipButton = this.page.locator( '[text=Skip]' );
        this.upgradeFeatureCheckList = this.page.locator( '.e-onboarding__checklist li' );
        this.connectYourAccountLink = this.page.locator( '.e-onboarding__footnote a' );

        // Step 2 - Hello Theme
        this.step2URL = '/wp-admin/admin.php?page=elementor-app#onboarding/hello';
        this.continueWithHelloThemeButton = this.page.locator( '[text="Continue with Hello Theme"]' );
        this.elementorTheme = this.page.locator( '[data-slug="hello-elementor"]' );
        this.twenty21Theme = this.page.locator( '[data-slug="twentytwentyone"]' );
        this.helloTheme = this.page.locator( '[data-slug="hello-elementor"]' );
        this.selectActivateTwent21Theme = this.page.locator( '[aria-label="Activate Twenty Twenty-One"]' );
        this.selectActivateHelloTheme = this.page.locator( '[aria-label="Activate Hello Elementor"]' );
        this.twenty21ThemeStatus = this.page.locator( '#hello-elementor-name span' );
        this.disclaimerNotice = this.page.locator( '.e-onboarding__footnote' );

        // Step 3 - Hello Theme Step
        this.step3URL = '/wp-admin/admin.php?page=elementor-app#onboarding/siteName';
        this.siteTitleFieldSelector = 'input.e-onboarding__site-name-input';
        this.siteTitleField = this.page.locator( 'input.e-onboarding__site-name-input' );
        this.nextButton = this.page.locator( '[text = next]' );

        // Step 4 - Site Logo Step
        this.step4URL = '/wp-admin/admin.php?page=elementor-app#onboarding/siteLogo';
        this.removeLogo = this.page.locator( '.eicon-trash-o' );
        this.potentialLogo = this.page.locator( '[alt="Potential Site Logo"]' );
        this.openMediaLibraryButton = this.page.locator( 'text=Open Media Library' );

        // Step 5 - Good to go Step
        this.step5URL = '/wp-admin/admin.php?page=elementor-app#onboarding/goodToGo';
        this.kitLibraryButton = this.page.locator( '.e-onboarding__cards-grid > a:nth-child(2)' );
        this.editWithBlankCanvas = this.page.locator( '.e-onboarding__cards-grid > a:nth-child(1)' );
        this.kitNames = this.page.locator( '.eps-card__headline.eps-h5' );
        this.kitImageLink = this.page.locator( '.e-kit-library__kit-item-overlay-overview-button' );
    }

    /*
    * Global - Functions
    */
    async checkBrokenCSS( page, url ) {
        // Validate the CSS on the page is not broken
        const requestFailed = [];

        this.page.on( 'request', async ( request ) => {
            if ( request.failure() !== null && request.url().includes( '.css' ) ) {
            requestFailed.push( request.url() );
            }
        } );

        // Go to the URL
        await this.page.goto( url, { waitUntil: 'networkidle' } );

        // Validate Broken CSS Requests
        await expect( requestFailed, `Failed Assets: ${ requestFailed.toString() }` ).toEqual( [] );
    }

    async gotoExperiments() {
        await this.page.goto( '/wp-admin/admin.php?page=elementor#tab-experiments', { waitUntil: 'networkidle' } );
    }

    async checkflexBoxIsOff() {
        this.flexBoxStatus = await this.page.locator( 'select#e-experiment-container' ).inputValue();
        if ( this.flexBoxStatus !== 'inactive' ) {
            await this.page.selectOption( 'select#e-experiment-container', 'inactive' );
            await this.page.locator( '#submit' ).click();
            await this.page.waitForLoadState( 'networkidle' );
            await expect( await this.page.locator( 'select#e-experiment-container' ).inputValue() ).toEqual( 'inactive' );
        }
    }

    async checkflexBoxIsBackToPreviousState() {
        const currentState = await this.page.locator( 'select#e-experiment-container' ).inputValue();
        if ( currentState !== 'active' ) {
            await this.page.selectOption( 'select#e-experiment-container', 'active' );
            await this.page.locator( '#submit' ).click();
            await this.page.waitForLoadState( 'networkidle' );
            await expect( await this.page.locator( 'select#e-experiment-container' ).inputValue() ).toEqual( 'active' );
        }
    }

    /*
    * First Step - Elementor Account - Functions
    */
    async gotoStep1() {
        await this.page.goto( this.step1URL, { waitUntil: 'networkidle' } );
    }

    async hoverOverGoProHeaderButton() {
        await this.upgradeHeaderButton.hover();
    }

    async selectAlreadyHaveElementorProLink() {
        await this.alreadyHaveElementorProLink.click();
    }

    async selectConnectYourAccountLink() {
        await this.connectYourAccountLink.click();
    }

    async checkGoProPopoverIsVisible() {
        await expect( this.goProPopover, `Go Pro popover is not visible` ).toBeVisible();
    }

    async selectUpgradeNowButton() {
        await this.upgradeNowButton.click();
    }

    async checkUserIsOnProPage( proPage ) {
        await expect( ( await proPage.url() ).split( '?' )[ 0 ], `"Upgrade" button does not take to the pro page` ).toEqual( 'https://elementor.com/pro/' );
    }

    async checkUserIsOnWpAdminPage() {
        await expect( this.page.url() ).toEqual( this.baseUrl + this.wpAdminPage );
    }

    async selectCloseOnboardingButton() {
        await this.closeOnboardingButton.click();
    }

    async createAccountButtonIsVisible() {
        await this.createMyAccountButton.isVisible();
    }

    async selectSkipButton() {
        await this.skipButton.click();
        await this.page.waitForLoadState( 'networkidle' );
    }

    async openPopUpToProPage() {
        const [ proPage ] = await Promise.all( [
			this.page.waitForEvent( 'popup' ),

			this.selectUpgradeNowButton(),
		] );

		await this.checkUserIsOnProPage( proPage );
    }

    async checkCurrentStepIsFilled( Step ) {
        await this.page.waitForLoadState( 'networkidle' );
        const el = await this.page.locator( '.e-onboarding__progress-bar .e-onboarding__progress-bar-item' ).nth( Step - 1 );
        await expect( el ).toHaveClass( 'e-onboarding__progress-bar-item e-onboarding__progress-bar-item--active' );
    }

    async checkButtonHasCorrectName( selector, ButtonName ) {
		await expect( await selector.innerText(), `Button is not called "${ ButtonName }"` ).toBe( ButtonName );
    }

    async selectCreateMyAccountCTA() {
        await this.createMyAccountButton.click();
    }

    async selectHeaderCreateAccountCTA() {
        await this.headerCreateAccountButton.click();
    }

    async checkUpgradeFeatureListIsCorrect( list ) {
        await this.page.waitForLoadState( 'networkidle' );
        const upgradeFeatureList = await this.upgradeFeatureCheckList.allTextContents();
        const missingFeatures = [];

        for ( let i = 0; i < list.length; i++ ) {
            if ( ! upgradeFeatureList.includes( list[ i ] ) ) {
            missingFeatures.push( list[ i ] );
            }
        }

        await expect( missingFeatures ).toEqual( [] );
    }

    async createMyAccountPopupWorks() {
        const [ createMyAccountPopUp ] = await Promise.all( [
			// It is important to call waitForEvent before click to set up waiting.
			this.page.waitForEvent( 'popup' ),
			// Opens popup.
			this.selectCreateMyAccountCTA(),
		] );
        await expect( await createMyAccountPopUp.title(), `"Sign up for Elementor" text is not present on the pop up` ).toEqual( 'Sign Up – My Account' );
        await createMyAccountPopUp.close();
    }

    async alreadyHaveElementorProWorks() {
        const [ alreadyHaveElementorProPopup ] = await Promise.all( [
			this.page.waitForEvent( 'popup' ),
			this.selectAlreadyHaveElementorProLink(),
		] );

		await expect( await alreadyHaveElementorProPopup.url() ).toContain( 'uploadAndInstallPro' );
    }

    async createAccountPopUpWorks() {
        const [ createAccountPopUp ] = await Promise.all( [
			// It is important to call waitForEvent before click to set up waiting.
			this.page.waitForEvent( 'popup' ),
			// Opens popup.
			this.selectHeaderCreateAccountCTA(),
		] );
        await expect( await createAccountPopUp.title(), `"Sign up for Elementor" text is not present on the pop up` ).toEqual( 'Sign Up – My Account' );
        await createAccountPopUp.close();
    }

    async signInPopupWorks() {
        const [ signIntoElementorPopup ] = await Promise.all( [
			this.page.waitForEvent( 'popup' ),
			this.selectConnectYourAccountLink(),
		] );

		await expect( await signIntoElementorPopup.url() ).toContain( this.loginURL );
        await signIntoElementorPopup.close();
    }

    /*
    * Second Step - Hello Theme - Functions
    */
    async gotoStep2() {
        await this.page.goto( this.step2URL, { waitUntil: 'networkidle' } );
    }

    async checkUserIsOnStepTwo() {
        await expect( this.page.url(), `User is not on Step 2 but instead on ${ await this.page.url() }` ).toEqual( this.baseUrl + this.step2URL );
    }

    async selectContinueWithHelloThemeButton() {
        await this.continueWithHelloThemeButton.click();
        await this.page.waitForLoadState( 'networkidle' );
        await this.page.waitForTimeout( 250 );
    }

    async checkUserIsOnStepThree() {
        await expect( this.page.url(), `User is not on Step 3 but instead on ${ await this.page.url() }` ).toEqual( this.baseUrl + this.step3URL );
    }

    async checkElementorThemeIsActive() {
        // Await this.page.waitForSelector( '#hello-elementor-name span' );
        await expect( await this.elementorTheme.getAttribute( 'class' ), `Elementor Theme is not active` ).toEqual( 'theme active' );
    }

    async checkTwenty21ThemeIsActive() {
        await expect( await this.twenty21Theme.getAttribute( 'class' ), `The Twenty 21 Theme is not active` ).toEqual( 'theme active' );
    }

    async checkDisclaimerIsPresent( disclaimer ) {
        await expect( this.disclaimerNotice ).toContainText( disclaimer );
    }

   /*
    * Third Step - Site Name - Functions
    */
    async gotoStep3() {
        await this.page.goto( this.step3URL );
    }

    async extractSiteTitle() {
        return await this.page.evaluate( () => elementorAppConfig.onboarding.siteName );
    }

    async checkTitleIsCorrect( title ) {
        await this.page.waitForSelector( this.siteTitleFieldSelector );
        await expect( await this.siteTitleField.getAttribute( 'value' ) ).toEqual( title );
    }

    async emptySiteNameField() {
        await this.page.fill( 'input[type="text"]', '' );
    }

    async insertPageName( pageName ) {
        await this.page.fill( 'input[type="text"]', pageName );
    }

   /*
    * Fourth Step - Site Logo - Functions
    */
    async gotoStep4() {
        await this.page.goto( this.step4URL, { waitUntil: 'networkidle' } );
    }

    async checkStepFourURL( url ) {
        await expect( await this.page.url(), `User is not on Step 4 but instead on ${ await this.page.url() }` ).toEqual( this.baseUrl + url );
    }

    async goToSiteItentityPage() {
        await this.page.goto( this.customizePage, { waitUntil: 'networkidle' } );
        await this.page.locator( '#accordion-section-title_tagline' ).click();
        await this.page.waitForLoadState( 'networkidle' );
        await this.page.waitForSelector( '#customize-control-custom_logo .upload-button' );
    }

    async uploadLogo() {
        await this.page.locator( '#customize-control-custom_logo .upload-button' ).first().click();
        await this.page.waitForLoadState( 'networkidle' );
        await this.page.locator( '#menu-item-browse' ).click();
        await this.page.waitForLoadState( 'networkidle' );
        await this.page.waitForTimeout( 500 );
        if ( await this.page.locator( '.attachment-preview div.thumbnail img' ).count() < 1 ) {
            const [ fileChooser ] = await Promise.all( [
                // It is important to call waitForEvent before click to set up waiting.
                this.page.waitForEvent( 'filechooser' ),
                // Opens the file chooser.
                this.page.locator( '#__wp-uploader-id-1' ).click(),
              ] );
              await fileChooser.setFiles( 'logo.png' );
            } else {
                await this.page.locator( '.attachment-preview div.thumbnail' ).first().click();
            }
        await this.page.locator( '.media-button-select:visible' ).click();
        await this.page.locator( ' .media-button-skip' ).click();
        await this.page.locator( '[value="Publish"]' ).click();
        await this.page.waitForSelector( '[value="Published"]' );
    }

    async checkLogoIsPresent() {
        await this.page.waitForLoadState( 'networkidle' );
        await expect( await this.potentialLogo.count() ).toEqual( 1 );
    }

    async checkNextBottonIsEnabled() {
        await expect( this.page.locator( '[text=next]' ) ).not.toHaveClass( 'e-onboarding__button--disabled' );
    }

    async checkNextBottonIsDisabled() {
        await expect( this.page.locator( '[text=next]' ) ).toHaveCSS( 'pointer-events', 'none' );
    }

    async removePotentialLogo() {
        await this.removeLogo.click();
        await this.page.waitForLoadState( 'networkidle' );
    }

    async checkUserIsOnStep5() {
        await expect( this.page.url() ).toEqual( this.baseUrl + this.step5URL );
    }

    async makeSureLogoIsRemoved() {
        await this.goToSiteItentityPage();
        await this.page.waitForLoadState( 'networkidle' );
        if ( await this.page.isVisible( '.button.remove-button' ) ) {
            this.logoRemoveButton.click();
            await this.page.locator( '[value="Publish"]' ).click();
            await this.page.waitForSelector( '[value="Published"]' );
        }
    }

    async checkLogoIsNotPresent() {
        await this.page.waitForLoadState( 'networkidle' );
        await expect( await this.potentialLogo.count() ).toEqual( 0 );
    }

    async uploadFile() {
        await this.page.locator( '#menu-item-browse' ).click();
        if ( await this.page.locator( '.attachment-preview div.thumbnail img' ).count() < 1 ) {
        const [ fileChooser ] = await Promise.all( [
            // It is important to call waitForEvent before click to set up waiting.
            this.page.waitForEvent( 'filechooser' ),
            // Opens the file chooser.
            this.page.locator( '#__wp-uploader-id-1' ).click(),
          ] );
          await fileChooser.setFiles( 'logo.png' );
        }
    }

    async addALogo() {
        await this.openMediaLibraryButton.click();
        await this.page.waitForLoadState( 'networkidle' );
        await this.page.locator( '#menu-item-browse' ).click();
        await this.page.waitForTimeout( 500 );
        if ( await this.page.locator( '.attachment-preview .thumbnail' ).first().isVisible() ) {
            await this.page.locator( '.attachment-preview .thumbnail' ).first().click();
        } else {
            await this.uploadFile();
        }
        await this.page.locator( '.media-button-select:visible' ).click();
        await this.nextButton.click();
        await this.goToSiteItentityPage();
    }

    /*
    * Fifth Step - Good to Go - Functions
    */

    async gotoStep5() {
        await this.page.goto( this.step5URL, { waitUntil: 'networkidle' } );
    }

    async selectKitLibaryOption() {
        await Promise.all( [
            this.page.waitForSelector( '[alt="Blank Canvas"]' ),
            this.kitLibraryButton.click(),
          ] );
    }

    async checkUserIsOnTheLibraryKitsPage() {
        await expect( await this.page.url().includes( '/kit-library' ), `The User is on: ${ this.page.url() }` ).toBeTruthy();
    }

    async checkFirstKitIsBlankCanvas() {
        await this.page.waitForTimeout( 1000 );
        await this.page.waitForSelector( '[alt="Blank Canvas"]' );
        await expect( await this.kitNames.nth( 0 ) ).toContainText( 'Blank Canvas' );
    }

    async selectEditWithBlankCanvas() {
        await this.editWithBlankCanvas.click();
    }

    async checkUserIsOnAFreshPost() {
        await expect( this.page.url().includes( '/wp-admin/post.php' ) ).toBeTruthy();
    }

    async selectTheBlankCanvasKit() {
        await this.kitImageLink.nth( 0 ).click();
    }
}

module.exports = { onboarding };
