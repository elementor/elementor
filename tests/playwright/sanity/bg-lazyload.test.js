const { test, expect } = require( '@playwright/test' );
const WpAdminPage = require( '../pages/wp-admin-page.js' );

test.beforeEach( async ( { page }, testInfo ) => {
	const wpAdmin = new WpAdminPage( page, testInfo );
	await wpAdmin.setExperiments( {
		e_lazyload: true,
	} );
} );

test( 'Background lazy load sanity test', async ( { page } ) => {
	await page.goto( `/law-firm-about` );
	// Get the first lezyload background element.

	const lazyloadSelector = '[data-e-bg-lazyload]:not(.lazyloaded)';
	await page.waitForSelector( lazyloadSelector );
	const beforeURL = await page.$eval( lazyloadSelector, ( el ) => {
		const property = window.getComputedStyle( el ).getPropertyValue( 'background-image' );
		return property.match( /url\((.*?)\)/ )[ 1 ].replace( /"/g, '' );
	} );
	expect( beforeURL ).toContain( 'Quote-About-Copy-1-150x150.png' );

	await page.evaluate( ( lazyloadSelectorScrollTo ) => {
		const lazyloadElement = document.querySelector( lazyloadSelectorScrollTo );
		lazyloadElement.scrollIntoView();
	}, lazyloadSelector );

	await page.waitForTimeout( 1500 );

	const cssVariable = await page.$eval( lazyloadSelector, ( el ) => {
		return window.getComputedStyle( el ).getPropertyValue( '--e-bg-lazyload' );
	} );
	expect( cssVariable ).toContain( 'Quote-About-Copy-1.png' );
} );

// AfterEach
test.afterEach( async ( { page }, testInfo ) => {
	const wpAdmin = new WpAdminPage( page, testInfo );
	await wpAdmin.setExperiments( {
		e_lazyload: false,
	} );
} );
