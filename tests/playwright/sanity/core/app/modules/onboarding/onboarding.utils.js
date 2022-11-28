const { expect } = require('@playwright/test');


class onboarding {

    constructor(page, baseURL ){
        this.page = page;
        this.baseUrl = baseURL.replace(/\/$/, "");
        this.themesPage = '/wp-admin/themes.php';
        this.wpAdminPage = '/wp-admin/';
        this.loginURL = 'https://my.elementor.com/login/';
        this.WpGeneralSettingsPage = '/wp-admin/options-general.php';
        this.customizePage = '/wp-admin/customize.php'

        //On all Steps
        this.closeOnboardingButton = this.page.locator('.eps-icon.eicon-close');
        this.headerCreateAccountButton = this.page.locator('#eps-app-header-btn-create-account')
        this.alreadyHaveElementorProLink = this.page.locator('.e-onboarding__go-pro-already-have');
        
        //Step 1 - Elementor Account Step
        this.step1URL = '/wp-admin/admin.php?page=elementor-app#onboarding';
        this.upgradeHeaderButton = this.page.locator( '#eps-app-header-btn-go-pro' );
        this.goProPopover = this.page.locator( '.e-app__popover.e-onboarding__go-pro' );
        this.upgradeNowButton = this.page.locator( '[text="Upgrade Now"]' );
        this.createMyAccountButton = this.page.locator('a.e-onboarding__button-action');
        this.skipButton = this.page.locator( 'text=Skip' );
        this.upgradeFeatureCheckList = this.page.locator('.e-onboarding__checklist li');
        this.connectYourAccountLink = this.page.locator('.e-onboarding__footnote a');
    

        //Step 2 - Hello Theme
        this.step2URL = '/wp-admin/admin.php?page=elementor-app#onboarding/hello';
        this.continueWithHelloThemeButton = this.page.locator('[text="Continue with Hello Theme"]');
        this.elementorTheme = this.page.locator('[data-slug="hello-elementor"]');
        this.twenty21Theme = this.page.locator('[data-slug="twentytwentyone"]');
        this.selectActivateTwent21Theme = this.page.locator('[aria-label="Activate Twenty Twenty-One"]');
        this.twenty21ThemeStatus = this.page.locator('#hello-elementor-name span');
        this.disclaimerNotice = this.page.locator('.e-onboarding__footnote');


        //Step 3 - Hello Theme Step
        this.step3URL = '/wp-admin/admin.php?page=elementor-app#onboarding/siteName';
        this.siteTitleFieldSelector = 'input.e-onboarding__site-name-input';
        this.siteTitleField = this.page.locator('input.e-onboarding__site-name-input');
        this.nextButton = this.page.locator('[text = next]');

        //Step 4 - Hello Theme Step
        this.step4URL = '/wp-admin/admin.php?page=elementor-app#onboarding/siteLogo';

        
    };


    /*
    * Global - Functions
    */
    async checkBrokenCSS(page,url) {
        // Validate the CSS on the page is not broken
        let requestFailed = []

        this.page.on('request', async request => {
            if(request.failure() !== null && request.url().includes('.css'))requestFailed.push(request.url());
        });
      
        //Go to the URL
        await this.page.goto(url, {waitUntil: "networkidle"});        
        
        //Validate Broken CSS Requests
        await expect(requestFailed, `Failed Assets: ${requestFailed.toString()}`).toEqual([])
    }


    /*
    * First Step - Elementor Account - Functions
    */
    async gotoStep1(){
        await this.page.goto(this.step1URL);
    };

    async hoverOverGoProHeaderButton(){
        await this.upgradeHeaderButton.hover();
    };

    async selectAlreadyHaveElementorProLink(){
        await this.alreadyHaveElementorProLink.click();
    }

    async selectConnectYourAccountLink(){
        await this.connectYourAccountLink.click();
    }

    async checkGoProPopoverIsVisible(){
        await expect( this.goProPopover , `Go Pro popover is not visible`).toBeVisible();
    };

    async selectUpgradeNowButton(){
        await this.upgradeNowButton.click();
    };

    async checkUserIsOnProPage(proPage){
        await expect((await proPage.url()).split('?')[0], `"Upgrade" button does not take to the pro page`).toEqual('https://elementor.com/pro/');
    };

    async checkUserIsOnWpAdminPage(){
        await expect(this.page.url()).toEqual(this.wpAdminPage);
    }

    async selectCloseOnboardingButton(){
        await this.closeOnboardingButton.click();
    }

    async createAccountButtonIsVisible(){
        await this.createMyAccountButton.isVisible()
    };

    async selectSkipButton(){
        await this.skipButton.click();
    };

    async checkCurrentStepIsFilled(Step){
        let el = this.page.locator('.e-onboarding__progress-bar .e-onboarding__progress-bar-item');
        let stepsToBeFilled = [];
        for(let i = 0; i < 5; i++){
            const stepNumber = el.nth(i)
            if(i == Step - 1) {
                if((await stepNumber.getAttribute('class')).includes('active')) {
                    continue
                } else {
                    stepsToBeFilled.push(`Icon ${i + 1}`) ;
                };
            };
        };
        await expect(stepsToBeFilled, `The page icons that are supposed to be filled: ${stepsToBeFilled} `).toEqual([])
    };

    async checkIconsNotSupposedToBeFilled(Step){
        let el = this.page.locator('.e-onboarding__progress-bar .e-onboarding__progress-bar-item');
        let stepsNotToBeFilled = [];
        for(let i = 0; i < 5; i++){
            const stepNumber = el.nth(i)
            if(i >= Step) {
                if((await stepNumber.getAttribute('class')).includes('active')) stepsNotToBeFilled.push(`Icon ${i + 1}`);
            };
        }
        await expect(stepsNotToBeFilled, `The page icons that are not supposed to be filled: ${stepsNotToBeFilled} `).toEqual([])
    };

    async checkButtonHasCorrectName(selector, ButtonName){
		await expect( await selector.innerText(), `Button is not called "${ButtonName}"`).toBe( ButtonName );
    };

    async selectCreateMyAccountCTA(){
        await this.createMyAccountButton.click()
    };

    async selectHeaderCreateAccountCTA(){
        await this.headerCreateAccountButton.click()
    };

    async checkCreateAccountPopupTitleIsVisible(createAccountPopUp){
        await expect(createAccountPopUp.locator( 'text=Sign up for Elementor' ), `"Sign up for Elementor" text is not present on the pop up`).toBeVisible();
    };

    async checkUpgradeFeatureListIsCorrect(list){
        await this.page.waitForLoadState('load');
        let upgradeFeatureList = await this.upgradeFeatureCheckList.allTextContents();
        let missingFeatures = [];
        for(let i = 0; i < list.length; i++){
            if(!upgradeFeatureList.includes(list[i])) missingFeatures.push(list[i]);
        };
        await expect(missingFeatures).toEqual([]);
    };






    /*
    * Second Step - Hello Theme - Functions
    */
    async gotoStep2(){
        await this.page.goto(this.step2URL);
    };
   
    async checkUserIsOnStepTwo(){
        console.log(this.baseUrl)
        await expect(this.page.url(), `User is not on Step 2 but instead on ${await this.page.url()}`).toEqual( this.baseUrl + this.step2URL);
   };

   async selectContinueWithHelloThemeButton(){
        await this.continueWithHelloThemeButton.click();
        await this.page.waitForLoadState('networkidle');
   };

   async checkUserIsOnStepThree(){
        await expect(this.page.url(), `User is not on Step 3 but instead on ${await this.page.url()}`).toEqual(this.baseUrl + this.step3URL);
   }

   async gotoThemesPage(){
        await this.page.goto(this.themesPage, {waitUntil : "networkidle"});
   };

   async checkElementorThemeIsActive(){
        //await this.page.waitForSelector('#hello-elementor-name span');  
        await expect(await this.elementorTheme.getAttribute('class'), `Elementor Theme is not active`).toEqual('theme active');
   };

   async activateTwenty21Theme(){
        await this.twenty21Theme.hover();
        await this.selectActivateTwent21Theme.click();
   };

   async checkTwenty21ThemeIsActive(){ 
        await expect(await this.twenty21Theme.getAttribute('class'), `The Twenty 21 Theme is not active`).toEqual('theme active');
   };

   async checkDisclaimerIsPresent(disclaimer){
        await expect(this.disclaimerNotice).toContainText(disclaimer);
   }

   



   /*
    * Third Step - Site Name - Functions
    */
    async gotoStep3(){
        await this.page.goto(this.step3URL);
    };

    async extractSiteTitle(){
        return await this.page.evaluate( () => elementorAppConfig.onboarding.siteName );
    }

    async checkTitleIsCorrect(title){
        await this.page.waitForSelector(this.siteTitleFieldSelector);
        await expect(await this.siteTitleField.getAttribute('value')).toEqual(title);
    }

    async emptySiteNameField(){
        await this.page.fill( 'input[type="text"]', '' )
    }

    async checkNextButtonIsDisabled(){
        await expect( this.nextButton , `The Next button is enabled`).toHaveClass( 'e-onboarding__button--disabled e-onboarding__button e-onboarding__button-action' );
    }

    async checkNextButtonIsEnabled(){
    await expect( this.nextButton , `The Next button is disabled`).toHaveClass( 'e-onboarding__button e-onboarding__button-action' );
    }

    async insertPageName(pageName){
        await this.page.fill( 'input[type="text"]', pageName );
    }




   /*
    * Third Four - Site Logo - Functions
    */
    async gotoStep4(){
        await this.page.goto(this.step4URL);
    };

    async checkStepFourURL(url){
        await expect(await this.page.url(), `User is not on Step 4 but instead on ${await this.page.url()}`).toEqual(url);
    }

    async goToSiteItentityPage(){
        await this.page.goto(this.customizePage);
        await this.page.locator('#accordion-section-title_tagline').click();
        await this.page.waitForSelector('#customize-control-custom_logo .upload-button')
        await this.page.locator('#customize-control-custom_logo .upload-button').first().click();
        await this.page.waitForLoadState('networkidle')
    }


};

module.exports = { onboarding };