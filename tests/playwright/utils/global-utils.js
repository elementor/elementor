// Playwright-dev-page.js
const { expect } = require( '@playwright/test' );

exports.GlobalUtils = class GlobalUtils {
    constructor( page, url ) {
        // Prod Selectors
        this.url = url;
        this.page = page;
    }

    async checkTextIsPresentInInSelectorElements( page, selector, testData ) {
        const textValues = await selector.allTextContents();
        if ( textValues.length > 0 ) {
            for ( let i = 0; i < testData.length; i++ ) {
                await expect( textValues.toString().includes( testData[ i ] ), `${ testData[ i ] } is not in the ${ textValues }` ).toEqual( true );
            }
        }
    }

    async checkTextIsNotPresentInInSelectorElements( page, selector, testData ) {
        const textValues = await selector.allTextContents();
        if ( textValues.length > 0 ) {
            for ( let i = 0; i < testData.length; i++ ) {
                await expect( ! textValues.toString().includes( testData[ i ] ), `${ testData[ i ] } is in the ${ textValues }` ).toEqual( true );
            }
        }
    }
};
