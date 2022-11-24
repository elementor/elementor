const { expect } = require('@playwright/test');


class onboarding {

    constructor(page, url){
        this.page = page;
        this.url = url;
        this.themesPage = 'http://test.local/wp-admin/themes.php';
        this.wpAdminPage = 'http://test.local/wp-admin/';
        this.loginURL = 'https://my.elementor.com/login/';

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
        this.step2URL = 'http://test.local/wp-admin/admin.php?page=elementor-app#onboarding/hello';
        this.continueWithHelloThemeButton = this.page.locator('[text="Continue with Hello Theme"]');
        this.elementorTheme = this.page.locator('[data-slug="hello-elementor"]');
        this.twenty21Theme = this.page.locator('[data-slug="twentytwentyone"]');
        this.selectActivateTwent21Theme = this.page.locator('[aria-label="Activate Twenty Twenty-One"]');
        this.twenty21ThemeStatus = this.page.locator('#hello-elementor-name span');
        this.disclaimerNotice = this.page.locator('.e-onboarding__footnote');


        //Step 3 - Hello Theme Step
        this.step3URL = 'http://test.local/wp-admin/admin.php?page=elementor-app#onboarding/siteName';
        
    };


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
    * Second Step - Elementor Account - Functions
    */
    async gotoStep2(){
        await this.page.goto(this.step2URL);
    };
   
    async checkUserIsOnStepTwo(){
        await expect(this.page.url()).toEqual(this.step2URL);
   };

   async selectContinueWithHelloThemeButton(){
        await this.continueWithHelloThemeButton.click();
        await this.page.waitForLoadState('networkidle');
   };

   async checkUserIsOnStepThree(){
        await expect(this.page.url()).toEqual(this.step3URL);
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
    * Third Step - Elementor Account - Functions
    */
    async gotoStep3(){
        await this.page.goto(this.step3URL);
    };

};

module.exports = { onboarding };