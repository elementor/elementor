import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../../parallelTest';
import WpAdminPage from '../../../../pages/wp-admin-page';
import EditorPage from '../../../../pages/editor-page';
import { CssConverterHelper, CssConverterResponse } from '../helper';

test.describe( 'Incremental Widget Conversion Tests', () => {
	const API_URL = 'http://elementor.local:10003/wp-json/elementor/v2/widget-converter';
	const ELEMENTOR_EDITOR_TIMEOUT = 30000;

	let wpAdmin: WpAdminPage;
	let cssHelper: CssConverterHelper;

	test.beforeAll( async ( { browser, apiRequests }, testInfo ) => {
		const page = await browser.newPage();
		const wpAdminPage = new WpAdminPage( page, testInfo, apiRequests );

		await wpAdminPage.setExperiments( {
			e_opt_in_v4_page: 'active',
			e_atomic_elements: 'active',
			e_nested_elements: 'active',
		} );

		await page.close();
		cssHelper = new CssConverterHelper();
	} );

	test.beforeEach( async ( { page, apiRequests }, testInfo ) => {
		wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
	} );

	test( 'Single paragraph element', async ( { page, request } ) => {
		const htmlContent = '<div class="test-single"><p>Hello World</p></div>';

		const apiResult = await cssHelper.convertHtmlWithCss( request, htmlContent, '', {
			createGlobalClasses: true,
		} );

		expect( apiResult.success ).toBe( true );
		expect( apiResult.widgets_created ).toBeGreaterThan( 0 );
		expect( apiResult.post_id ).toBeDefined();

		await page.goto( apiResult.edit_url, {
			timeout: ELEMENTOR_EDITOR_TIMEOUT,
		} );

		const editor = new EditorPage( page, wpAdmin.testInfo );
		await editor.waitForEditorToLoad();

		const elementorFrame = editor.getPreviewFrame();
		await elementorFrame.waitForLoadState();

		const elementsCount = await page.evaluate( () => {
			const currentDoc = window.elementor?.documents?.getCurrent();
			return currentDoc?.container?.children?.length || 0;
		} );

		expect( elementsCount ).toBeGreaterThan( 0 );
	} );

	test( 'Single div with paragraph', async ( { page, request } ) => {
		const htmlContent = '<div class="test-container"><div><p>Hello Container</p></div></div>';

		const apiResult = await cssHelper.convertHtmlWithCss( request, htmlContent, '', {
			createGlobalClasses: true,
		} );

		expect( apiResult.success ).toBe( true );
		expect( apiResult.widgets_created ).toBeGreaterThan( 0 );

		await page.goto( apiResult.edit_url, {
			timeout: ELEMENTOR_EDITOR_TIMEOUT,
		} );

		const editor = new EditorPage( page, wpAdmin.testInfo );
		await editor.waitForEditorToLoad();

		const elementorFrame = editor.getPreviewFrame();
		await elementorFrame.waitForLoadState();

		const elementsCount = await page.evaluate( () => {
			const currentDoc = window.elementor?.documents?.getCurrent();
			return currentDoc?.container?.children?.length || 0;
		} );

		expect( elementsCount ).toBeGreaterThan( 0 );
	} );

	test( 'Two paragraphs', async ( { page, request } ) => {
		const htmlContent = '<div class="test-two"><p>First paragraph</p><p>Second paragraph</p></div>';

		const apiResult = await cssHelper.convertHtmlWithCss( request, htmlContent, '', {
			createGlobalClasses: true,
		} );

		expect( apiResult.success ).toBe( true );
		expect( apiResult.widgets_created ).toBeGreaterThan( 0 );

		await page.goto( apiResult.edit_url, {
			timeout: ELEMENTOR_EDITOR_TIMEOUT,
		} );

		const editor = new EditorPage( page, wpAdmin.testInfo );
		await editor.waitForEditorToLoad();

		const elementorFrame = editor.getPreviewFrame();
		await elementorFrame.waitForLoadState();

		const elementsCount = await page.evaluate( () => {
			const currentDoc = window.elementor?.documents?.getCurrent();
			return currentDoc?.container?.children?.length || 0;
		} );

		expect( elementsCount ).toBeGreaterThan( 0 );
	} );

	test( 'Nested structure with heading and paragraph', async ( { page, request } ) => {
		const htmlContent = '<div class="test-nested"><div class="container"><h2>Title</h2><p>Content paragraph</p></div></div>';

		const apiResult = await cssHelper.convertHtmlWithCss( request, htmlContent, '', {
			createGlobalClasses: true,
		} );

		expect( apiResult.success ).toBe( true );
		expect( apiResult.widgets_created ).toBeGreaterThan( 0 );

		await page.goto( apiResult.edit_url, {
			timeout: ELEMENTOR_EDITOR_TIMEOUT,
		} );

		const editor = new EditorPage( page, wpAdmin.testInfo );
		await editor.waitForEditorToLoad();

		const elementorFrame = editor.getPreviewFrame();
		await elementorFrame.waitForLoadState();

		const elementsCount = await page.evaluate( () => {
			const currentDoc = window.elementor?.documents?.getCurrent();
			return currentDoc?.container?.children?.length || 0;
		} );

		expect( elementsCount ).toBeGreaterThan( 0 );
	} );

	test( 'Complex multi-section structure', async ( { page, request } ) => {
		const htmlContent = `
			<div class="test-complex">
				<div class="header">
					<h1>Main Title</h1>
					<p>Subtitle</p>
				</div>
				<div class="content">
					<p>First content paragraph</p>
					<p>Second content paragraph</p>
				</div>
			</div>
		`;

		const apiResult = await cssHelper.convertHtmlWithCss( request, htmlContent, '', {
			createGlobalClasses: true,
		} );

		expect( apiResult.success ).toBe( true );
		expect( apiResult.widgets_created ).toBeGreaterThan( 0 );

		await page.goto( apiResult.edit_url, {
			timeout: ELEMENTOR_EDITOR_TIMEOUT,
		} );

		const editor = new EditorPage( page, wpAdmin.testInfo );
		await editor.waitForEditorToLoad();

		const elementorFrame = editor.getPreviewFrame();
		await elementorFrame.waitForLoadState();

		const elementsCount = await page.evaluate( () => {
			const currentDoc = window.elementor?.documents?.getCurrent();
			return currentDoc?.container?.children?.length || 0;
		} );

		expect( elementsCount ).toBeGreaterThan( 0 );
	} );

	test( 'URL conversion with selector', async ( { page } ) => {
		const response = await page.request.post( API_URL, {
			data: {
				type: 'url',
				content: 'https://oboxthemes.com/',
				selector: '.elementor-1140',
			},
		} );

		expect( response.status() ).toBe( 200 );
		const data = await response.json() as CssConverterResponse;

		expect( data.success ).toBe( true );
		expect( data.widgets_created ).toBeGreaterThan( 0 );

		await page.goto( data.edit_url, {
			timeout: ELEMENTOR_EDITOR_TIMEOUT,
		} );

		const editor = new EditorPage( page, wpAdmin.testInfo );
		await editor.waitForEditorToLoad();

		const elementorFrame = editor.getPreviewFrame();
		await elementorFrame.waitForLoadState();

		const elementsCount = await page.evaluate( () => {
			const currentDoc = window.elementor?.documents?.getCurrent();
			return currentDoc?.container?.children?.length || 0;
		} );

		expect( elementsCount ).toBeGreaterThan( 0 );
	} );
} );

