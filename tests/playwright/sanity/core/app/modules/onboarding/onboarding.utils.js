const { expect } = require('@playwright/test');


class onboarding {

    constructor(page, url){
        this.page = page;
        this.url = url;
        
        //Step 1 - Elementor Account Step
        this.step1URL = '/wp-admin/admin.php?page=elementor-app#onboarding';
        this.upgradeHeaderButton = this.page.locator( '#eps-app-header-btn-go-pro' );
        this.goProPopover = this.page.locator( '.e-app__popover.e-onboarding__go-pro' );
        this.upgradeNowButton = this.page.locator( '[text="Upgrade Now"]' );
        this.createAccountButton = this.page.locator('a.e-onboarding__button-action');
    

        //Step 2 - Onboarding


        //Step 3 - Hello Theme Step
        
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

    async checkGoProPopoverIsVisible(){
        await expect( this.goProPopover , `Go Pro popover is not visible`).toBeVisible();
    };

    async selectUpgradeNowButton(){
        await this.upgradeNowButton.click();
    };

    async checkUserIsOnProPage(proPage){
        await expect((await proPage.url()).split('?')[0], `"Upgrade" button does not take to the pro page`).toEqual('https://elementor.com/pro/');

    };

    async createAccountButtonIsVisible(){
        await createAccountButton.isVisible()
    }

    async checkOnlyCorrectStepsAreFilled(Step){
        let el = this.page.locator('.e-onboarding__progress-bar .e-onboarding__progress-bar-item');
        let stepsToBeFilled = [];
        for(let i = 0; i < 5; i++){
            const stepNumber = el.nth(i)
            if(i <= Step - 1) {
                if((await stepNumber.getAttribute('class')).includes('active')) {
                    continue
                } else {
                    stepsToBeFilled.push(`Icon ${i + 1}`) ;
                }
            };
        }
        await expect(stepsToBeFilled, `The page icons that are supposed to be filled: ${stepsToBeFilled} `).toEqual([])
    }

    async checkIconsNotSupposedToBeFilled(Step){
        let el = this.page.locator('.e-onboarding__progress-bar .e-onboarding__progress-bar-item');
        let stepsNotToBeFilled = [];
        for(let i = 0; i < 5; i++){
            const stepNumber = el.nth(i)
            if(i <= Step - 1) {
                if(!(await stepNumber.getAttribute('class')).includes('active')) stepsNotToBeFilled.push(`Icon ${i + 1}`) ;
            };
        }
        await expect(stepsNotToBeFilled, `The page icons that are not supposed to be filled: ${stepsNotToBeFilled} `).toEqual([])
    }

    async checkButtonHasCorrectName(selector, ButtonName){
		await expect( await selector.innerText(), `Button is not called "${ButtonName}"`).toBe( ButtonName );
    }

    async selectCreateMyAccountCTA(){
        await this.createAccountButton.click()
    }

};

module.exports = { onboarding };