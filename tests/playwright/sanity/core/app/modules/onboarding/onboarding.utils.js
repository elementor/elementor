const { expect } = require('@playwright/test');


class onboarding {

    constructor(page, url){
        this.page = page;
        this.url = url;
        
        //Step 1 - Elementor Account Step
        this.step1URL = '/wp-admin/admin.php?page=elementor-app#onboarding';
        this.upgradeHeaderButton = this.page.locator( '#eps-app-header-btn-go-pro' );
        this.goProPopover = this.page.locator( '.e-app__popover.e-onboarding__go-pro' );
        //this.upgradeNowButton = popup.locator( '[text="Upgrade Now"]' );
        this.createAccountButton = this.page.locator()

        //Step 2 - Onboarding


        //Step 3 - Hello Theme Step
        
    };

    async gotoStep1(){
        console.log('/wp-admin/admin.php?page=elementor-app#onboarding')
        await this.page.goto(this.step1URL);
    };

    async hoverOverGoProHeaderButton(){
        await this.upgradeHeaderButton.hover();
    };

    async goProPopoverIsVisible(){
        await expect( this.goProPopover , `Go Pro popover is not visible`).toBeVisible();
    };

    // async selectUpgradeNowButton(){
    //     await this.page.locator( this.upgradeNowButton , `"Upgrade Now" button is not visible`).click();
    // };

    async validateUserIsOnProPage(proPage){
        await expect((await proPage.url('https://elementor.com/pro/')[0]).split(), `"Upgrade" button does not take to the pro page`).toEqual('https://elementor.com/pro/');
    };

    async createAccountButtonIsVisible(){
        await createAccountButton.isVisible()
    }

};

module.exports = { onboarding };