import { test, expect } from '@playwright/test';

test.describe( 'Per-File CSS Parsing', () => {
	const baseUrl = process.env.BASE_URL || 'http://elementor.local:10003';
	const apiUrl = `${ baseUrl }/wp-json/elementor/v2/widget-converter`;

	test( 'should convert simple HTML with inline CSS', async ( { request } ) => {
		const response = await request.post( apiUrl, {
			data: {
				type: 'html',
				content: '<div class="test"><h1>Hello World</h1><p>This is a test</p></div><style>.test { background: blue; } h1 { color: red; font-size: 36px; } p { color: green; }</style>',
			},
		} );

		expect( response.ok() ).toBeTruthy();
		const data = await response.json();

		expect( data.success ).toBe( true );
		expect( data.widgets_created ).toBeGreaterThan( 0 );
		expect( data.post_id ).toBeDefined();
	} );

	test( 'should handle malformed CSS gracefully', async ( { request } ) => {
		const response = await request.post( apiUrl, {
			data: {
				type: 'html',
				content: '<h1>Test</h1><style>h1 { color: red; } .bad { calc(2 - ) }</style>',
			},
		} );

		expect( response.ok() ).toBeTruthy();
		const data = await response.json();

		expect( data.success ).toBe( true );
		expect( data.widgets_created ).toBeGreaterThan( 0 );
	} );

	test( 'should convert URL with selector', async ( { request } ) => {
		const response = await request.post( apiUrl, {
			data: {
				type: 'url',
				content: 'https://oboxthemes.com/',
				selector: '.elementor-element-6d397c1',
			},
		} );

		expect( response.ok() ).toBeTruthy();
		const data = await response.json();

		expect( data.success ).toBe( true );
		expect( data.widgets_created ).toBeGreaterThan( 0 );
		expect( data.post_id ).toBeDefined();
	} );

	test( 'should handle minified CSS', async ( { request } ) => {
		const minifiedCss = '.a{color:red;}.b{color:blue;}.c{color:green;}';
		const response = await request.post( apiUrl, {
			data: {
				type: 'html',
				content: `<div class="a">A</div><div class="b">B</div><div class="c">C</div><style>${ minifiedCss }</style>`,
			},
		} );

		expect( response.ok() ).toBeTruthy();
		const data = await response.json();

		expect( data.success ).toBe( true );
		expect( data.widgets_created ).toBeGreaterThan( 0 );
	} );

	test( 'should beautify minified CSS before processing', async ( { request } ) => {
		const minifiedCss = '.btn{background-color:#007bff;border:1px solid #007bff;color:#fff;padding:10px 20px;border-radius:4px}.btn:hover{background-color:#0056b3;border-color:#004085}';
		const response = await request.post( apiUrl, {
			data: {
				type: 'html',
				content: `<button class="btn">Click me</button><style>${ minifiedCss }</style>`,
			},
		} );

		expect( response.ok() ).toBeTruthy();
		const data = await response.json();

		expect( data.success ).toBe( true );
		expect( data.widgets_created ).toBeGreaterThan( 0 );

		// Check that CSS beautification statistics are present
		if ( data.stats ) {
			expect( data.stats.css_size_bytes ).toBeDefined();
			expect( data.stats.beautified_css_size_bytes ).toBeDefined();
			// Beautified CSS should typically be larger due to formatting
			expect( data.stats.beautified_css_size_bytes ).toBeGreaterThanOrEqual( data.stats.css_size_bytes );
		}
	} );

	test( 'should skip at-rules gracefully', async ( { request } ) => {
		const cssWithAtRules = `
			h1 { color: red; }
			@media (max-width: 768px) { h1 { color: blue; } }
			@font-face { font-family: 'Test'; src: url('test.woff'); }
			p { color: green; }
		`;
		const response = await request.post( apiUrl, {
			data: {
				type: 'html',
				content: `<h1>Title</h1><p>Text</p><style>${ cssWithAtRules }</style>`,
			},
		} );

		expect( response.ok() ).toBeTruthy();
		const data = await response.json();

		expect( data.success ).toBe( true );
		expect( data.widgets_created ).toBeGreaterThan( 0 );
	} );
} );

