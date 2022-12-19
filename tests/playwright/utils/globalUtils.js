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

    async checkListOfLinks( goToURL, obj, linkSelector ) {
        for ( let i = 0; i < Object.keys( obj ).length; i++ ) {
            await this.page.goto( goToURL );
            await this.checkTextIsPresentInArray( this.page, linkSelector, Object.keys( obj )[ i ] );
            await expect( linkSelector.nth( i ).getAttribute( 'href' ), `Link: ${ Object.values( obj )[ i ] } is missing the href address` ).not.toEqual( '' );
            await expect( linkSelector.nth( i ).getAttribute( 'href' ), `Link: ${ Object.values( obj )[ i ] } accidently contains a placeholder` ).not.toEqual( '#' );
            await expect( linkSelector.nth( i ).getAttribute( 'href' ), `Link: ${ Object.values( obj )[ i ] } is missing the ` ).not.toEqual( null );
            if ( null === await linkSelector.nth( i ).getAttribute( 'target' ) ) {
                await linkSelector.nth( i ).click();
                await expect( this.page ).toHaveURL( Object.values( obj )[ i ] );
            } else if ( '_blank' === await linkSelector.nth( i ).getAttribute( 'target' ) ) {
                const [ newTabPage ] = await Promise.all( [
                    this.page.waitForEvent( 'popup' ),
                    linkSelector.nth( i ).click(), // Opens a new tab
                  ] );
                await expect( newTabPage, `The Link ${ Object.values( obj )[ i ] } is taking the instead to the ${ newTabPage.url }` ).toHaveURL( Object.values( obj )[ i ] );
            }
        }
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
};
