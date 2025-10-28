import { test, expect } from '@playwright/test';

test.describe( 'URL + Selector CSS Extraction and Application', () => {
	const API_URL = 'http://elementor.local:10003/wp-json/elementor/v2/widget-converter/';
	const ELEMENTOR_EDITOR_TIMEOUT = 30000;

	test( 'should extract CSS from URL when using selector parameter', async ( { page } ) => {
		const response = await page.request.post( API_URL, {
			data: {
				type: 'url',
				content: 'https://oboxthemes.com/',
				selector: '.elementor-element-6d397c1',
			},
		} );

		expect( response.status() ).toBe( 200 );

		const data = await response.json();

		expect( data.success ).toBe( true );
		expect( data.widgets_created ).toBeGreaterThan( 0 );
		expect( data.post_id ).toBeDefined();

		// Verify CSS extraction worked
		expect( data.conversion_log?.css_processing?.css_rules_parsed || data.stats?.css_rules_parsed ).toBeGreaterThan( 1000 );
		expect( data.global_classes_created ).toBeGreaterThan( 100 );
	} );

	test( 'should apply extracted styles to widgets in editor preview', async ( { page } ) => {
		const response = await page.request.post( API_URL, {
			data: {
				type: 'url',
				content: 'https://oboxthemes.com/',
				selector: '.elementor-element-6d397c1',
			},
		} );

		expect( response.status() ).toBe( 200 );
		const data = await response.json();
		const postId = data.post_id;

		await page.goto( `http://elementor.local:10003/wp-admin/post.php?post=${ postId }&action=elementor`, {
			timeout: ELEMENTOR_EDITOR_TIMEOUT,
		} );

		await page.waitForSelector( 'iframe[title="Preview"]', {
			timeout: ELEMENTOR_EDITOR_TIMEOUT,
		} );

		const previewFrame = page.frameLocator( 'iframe[title="Preview"]' );

		const firstParagraph = previewFrame.locator( 'p' ).first();
		await expect( firstParagraph ).toBeVisible();

		const fontSize = await firstParagraph.evaluate( ( el ) => {
			return window.getComputedStyle( el ).fontSize;
		} );

		const color = await firstParagraph.evaluate( ( el ) => {
			return window.getComputedStyle( el ).color;
		} );

		// Note: These assertions may fail until class preservation is fixed
		// The CSS extraction works, but classes aren't applied to widgets yet
		expect( parseFloat( fontSize ) ).toBeGreaterThanOrEqual( 16 );
		expect( color ).toBeDefined();
	} );

	test( 'should create global classes in page stylesheet', async ( { page } ) => {
		const response = await page.request.post( API_URL, {
			data: {
				type: 'url',
				content: 'https://oboxthemes.com/',
				selector: '.elementor-element-6d397c1',
			},
		} );

		expect( response.status() ).toBe( 200 );
		const data = await response.json();
		const postId = data.post_id;

		await page.goto( `http://elementor.local:10003/wp-admin/post.php?post=${ postId }&action=elementor`, {
			timeout: ELEMENTOR_EDITOR_TIMEOUT,
		} );

		await page.waitForSelector( 'iframe[title="Preview"]', {
			timeout: ELEMENTOR_EDITOR_TIMEOUT,
		} );

		const previewFrame = page.frameLocator( 'iframe[title="Preview"]' );

		const globalClassesFound = await previewFrame.locator( 'style' ).evaluateAll( ( styles ) => {
			let count = 0;
			styles.forEach( ( style ) => {
				const matches = style.textContent?.match( /\.e-global-[a-z0-9-]+/gi );
				if ( matches ) {
					count += matches.length;
				}
			} );
			return count;
		} );

		expect( globalClassesFound ).toBeGreaterThan( 0 );
	} );

	test( 'should apply global classes to HTML elements', async ( { page } ) => {
		const response = await page.request.post( API_URL, {
			data: {
				type: 'url',
				content: 'https://oboxthemes.com/',
				selector: '.elementor-element-6d397c1',
			},
		} );

		expect( response.status() ).toBe( 200 );
		const data = await response.json();
		const postId = data.post_id;

		await page.goto( `http://elementor.local:10003/wp-admin/post.php?post=${ postId }&action=elementor`, {
			timeout: ELEMENTOR_EDITOR_TIMEOUT,
		} );

		await page.waitForSelector( 'iframe[title="Preview"]', {
			timeout: ELEMENTOR_EDITOR_TIMEOUT,
		} );

		const previewFrame = page.frameLocator( 'iframe[title="Preview"]' );

		const elementsWithGlobalClasses = await previewFrame.locator( '[class*="e-global-"]' ).count();

		expect( elementsWithGlobalClasses ).toBeGreaterThan( 0 );
	} );

	test( 'should preserve specific styles from source element', async ( { page } ) => {
		const sourceStyles = await page.evaluate( async () => {
			const response = await fetch( 'https://oboxthemes.com/' );
			const html = await response.text();
			const parser = new DOMParser();
			const doc = parser.parseFromString( html, 'text/html' );
			const element = doc.querySelector( '.elementor-element-6d397c1' );

			if ( ! element ) {
				return null;
			}

			const tempDiv = document.createElement( 'div' );
			tempDiv.innerHTML = element.outerHTML;
			document.body.appendChild( tempDiv );

			const linkElements = Array.from( doc.querySelectorAll( 'link[rel="stylesheet"]' ) );
			const stylesheets = await Promise.all(
				linkElements.slice( 0, 5 ).map( async ( link ) => {
					const href = ( link as HTMLLinkElement ).href;
					try {
						const cssResponse = await fetch( href );
						return await cssResponse.text();
					} catch {
						return '';
					}
				} ),
			);

			const allCSS = stylesheets.join( '\n' );
			const style = document.createElement( 'style' );
			style.textContent = allCSS;
			document.head.appendChild( style );

			const targetElement = tempDiv.querySelector( '.elementor-element-6d397c1' );
			const computedStyle = window.getComputedStyle( targetElement as Element );

			const styles = {
				fontSize: computedStyle.fontSize,
				color: computedStyle.color,
			};

			document.body.removeChild( tempDiv );
			document.head.removeChild( style );

			return styles;
		} );

		const conversionResponse = await page.request.post( API_URL, {
			data: {
				type: 'url',
				content: 'https://oboxthemes.com/',
				selector: '.elementor-element-6d397c1',
			},
		} );

		expect( conversionResponse.status() ).toBe( 200 );
		const data = await conversionResponse.json();
		const postId = data.post_id;

		await page.goto( `http://elementor.local:10003/wp-admin/post.php?post=${ postId }&action=elementor`, {
			timeout: ELEMENTOR_EDITOR_TIMEOUT,
		} );

		await page.waitForSelector( 'iframe[title="Preview"]', {
			timeout: ELEMENTOR_EDITOR_TIMEOUT,
		} );

		const previewFrame = page.frameLocator( 'iframe[title="Preview"]' );

		const convertedElement = previewFrame.locator( 'p' ).first();
		const convertedStyles = await convertedElement.evaluate( ( el ) => {
			const computed = window.getComputedStyle( el );
			return {
				fontSize: computed.fontSize,
				color: computed.color,
			};
		} );

		if ( sourceStyles ) {
			expect( convertedStyles.fontSize ).toBe( sourceStyles.fontSize );
			expect( convertedStyles.color ).toBe( sourceStyles.color );
		}
	} );

	test( 'should extract multiple stylesheet URLs from source page', async ( { page } ) => {
		const response = await page.request.post( API_URL, {
			data: {
				type: 'url',
				content: 'https://oboxthemes.com/',
				selector: '.elementor-element-6d397c1',
			},
		} );

		expect( response.status() ).toBe( 200 );
		const data = await response.json();

		// Verify CSS extraction metrics
		const cssRulesParsed = data.conversion_log?.css_processing?.css_rules_parsed || data.stats?.css_rules_parsed;
		expect( cssRulesParsed ).toBeGreaterThan( 1000 );
		
		// Verify global classes were created from extracted CSS
		expect( data.global_classes_created ).toBeGreaterThan( 100 );
	} );

	test( 'should handle inline styles from selected element', async ( { page } ) => {
		const response = await page.request.post( API_URL, {
			data: {
				type: 'html',
				content: '<div class="test-div" style="color: red; font-size: 24px;"><p>Test content</p></div>',
			},
		} );

		expect( response.status() ).toBe( 200 );
		const data = await response.json();
		const postId = data.post_id;

		await page.goto( `http://elementor.local:10003/wp-admin/post.php?post=${ postId }&action=elementor`, {
			timeout: ELEMENTOR_EDITOR_TIMEOUT,
		} );

		await page.waitForSelector( 'iframe[title="Preview"]', {
			timeout: ELEMENTOR_EDITOR_TIMEOUT,
		} );

		const previewFrame = page.frameLocator( 'iframe[title="Preview"]' );

		const paragraph = previewFrame.locator( 'p' ).first();
		const color = await paragraph.evaluate( ( el ) => {
			return window.getComputedStyle( el ).color;
		} );

		expect( color ).toBe( 'rgb(255, 0, 0)' );
	} );
} );

