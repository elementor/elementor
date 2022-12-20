// Playwright-dev-page.js
const { expect } = require( '@playwright/test' );

exports.GlobalUtils = class GlobalUtils {
    constructor( page, url ) {
        // Prod Selectors
        this.url = url;
        this.page = page;
    }

    async checkTextIsPresentInArray( page, selector, testData ) {
        const featuresList = await selector.allTextContents();
        for ( let i = 0; i < testData.length; i++ ) {
            await expect( featuresList.toString().includes( testData[ i ] ), `${ testData[ i ] } is not in the ${ featuresList }` ).toEqual( true );
        }
    }

    async checkTextIsNotPresentInArray( page, selector, testData ) {
        const featuresList = await selector.allTextContents();
        for ( let i = 0; i < testData.length; i++ ) {
            await expect( ! featuresList.toString().includes( testData[ i ] ), `${ testData[ i ] } is in the ${ featuresList }` ).toEqual( true );
        }
    }
};
