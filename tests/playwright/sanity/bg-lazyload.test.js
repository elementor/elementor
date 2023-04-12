const { test, expect } = require( '@playwright/test' );
const { createPage, deletePage } = require( '../utilities/rest-api' );
const WpAdminPage = require( '../pages/wp-admin-page.js' );
const EditorPage = require( '../pages/editor-page' );

test.describe( 'Background Lazy Load', () => {
	let pageId;

	test.beforeAll( async ( { browser }, testInfo ) => {
		const context = await browser.newContext();
		const page = await context.newPage();
		const wpAdmin = new WpAdminPage( page, testInfo );
		await wpAdmin.setExperiments( {
			e_lazyload: true,
		} );
	} );

	test.afterAll( async ( { browser }, testInfo ) => {
		const context = await browser.newContext();
		const page = await context.newPage();
		const wpAdmin = new WpAdminPage( page, testInfo );
		await wpAdmin.setExperiments( {
			e_lazyload: false,
		} );
	} );

	test.beforeEach( async () => {
		pageId = await createPage();
	} );

	test.afterEach( async () => {
		await deletePage( pageId );
	} );

	test( 'Background lazy load sanity test', async ( { context, page }, testInfo ) => {
		const editorPage = new EditorPage( page, testInfo );
		const templatePath = `../templates/law-firm-about.json`;
		await editorPage.gotoPostId( pageId );
		await editorPage.loadTemplate( templatePath );

		const previewPage = await editorPage.previewChanges( context );

		const lazyloadSelector = '[data-e-bg-lazyload]:not(.lazyloaded)';
		await previewPage.waitForSelector( lazyloadSelector );
		const beforeURL = await previewPage.$eval( lazyloadSelector, ( el ) => {
			return window.getComputedStyle( el ).getPropertyValue( 'background-image' );
		} );
		expect( beforeURL ).toContain( 'none' );

		await previewPage.evaluate( ( lazyloadSelectorScrollTo ) => {
			const lazyloadElement = document.querySelector( lazyloadSelectorScrollTo );
			lazyloadElement.scrollIntoView();
			lazyloadElement.setAttribute( 'bg-test-element', '' );
		}, lazyloadSelector );

		await previewPage.waitForTimeout( 1500 );

		const hasClass = await previewPage.$eval( '[bg-test-element]', ( el ) => {
			return el.classList.contains( 'lazyloaded' );
		} );
		expect( hasClass ).toBe( true );

		const cssVariable = await previewPage.$eval( '[bg-test-element]', ( el ) => {
			return window.getComputedStyle( el ).getPropertyValue( '--e-bg-lazyload' );
		} );
		expect( cssVariable ).toContain( 'Quote-About-Copy-1.png' );
	} );
} );
