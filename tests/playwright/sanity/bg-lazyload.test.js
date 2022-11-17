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
		return window.getComputedStyle( el ).getPropertyValue( 'background-image' );
	} );
	expect( beforeURL ).toContain( 'none' );

	await page.evaluate( ( lazyloadSelectorScrollTo ) => {
		const lazyloadElement = document.querySelector( lazyloadSelectorScrollTo );
		lazyloadElement.scrollIntoView();
		lazyloadElement.setAttribute( 'bg-test-element', '' );
	}, lazyloadSelector );

	await page.waitForTimeout( 1500 );

	const hasClass = await page.$eval( '[bg-test-element]', ( el ) => {
		return el.classList.contains( 'lazyloaded' );
	} );
	expect( hasClass ).toBe( true );

	const cssVariable = await page.$eval( '[bg-test-element]', ( el ) => {
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
