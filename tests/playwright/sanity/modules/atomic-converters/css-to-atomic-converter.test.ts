import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../parallelTest';
import WpAdminPage from '../../../pages/wp-admin-page';
import ApiRequests from '../../../assets/api-requests';

test.describe( 'CSS-to-Atomic Converter @atomic-converters', () => {
	let wpAdmin: WpAdminPage;
	let apiRequests: ApiRequests;

	test.beforeEach( async ( { page, apiRequests: requests }, testInfo ) => {
		wpAdmin = new WpAdminPage( page, testInfo, requests );
		apiRequests = requests;
	} );

	test( 'should convert color property to atomic PropValue format', async ( { request } ) => {
		const testCases = [
			{
				cssString: 'color: red;',
				expected: {
					hasColorProp: true,
					colorValue: /^(red|#ff0000|rgb\(255,\s*0,\s*0\))$/i,
					unsupportedCount: 0,
				},
			},
			{
				cssString: 'color: #00ff00;',
				expected: {
					hasColorProp: true,
					colorValue: /^(#00ff00|rgb\(0,\s*255,\s*0\))$/i,
					unsupportedCount: 0,
				},
			},
			{
				cssString: 'color: rgb(0, 0, 255);',
				expected: {
					hasColorProp: true,
					colorValue: /^(rgb\(0,\s*0,\s*255\)|#0000ff)$/i,
					unsupportedCount: 0,
				},
			},
			{
				cssString: 'color: rgba(255, 0, 255, 0.8);',
				expected: {
					hasColorProp: true,
					colorValue: /^rgba\(255,\s*0,\s*255,\s*0\.8\)$/i,
					unsupportedCount: 0,
				},
			},
			{
				cssString: 'color: hsl(120, 100%, 50%);',
				expected: {
					hasColorProp: true,
					colorValue: /^(hsl\(120,\s*100%,\s*50%\)|#[0-9a-f]{6})$/i,
					unsupportedCount: 0,
				},
			},
			{
				cssString: 'color: transparent;',
				expected: {
					hasColorProp: true,
					colorValue: 'rgba(0,0,0,0)',
					unsupportedCount: 0,
				},
			},
		];

		for ( const testCase of testCases ) {
			await test.step( `Convert ${ testCase.cssString }`, async () => {
				const response = await request.post( '/wp-json/elementor/v1/css-to-atomic', {
					headers: {
						'Content-Type': 'application/json',
						'X-WP-Nonce': apiRequests.nonce,
					},
					data: {
						cssString: testCase.cssString,
					},
				} );

				expect( response.status() ).toBe( 200 );

				const data = await response.json();

				expect( data ).toHaveProperty( 'props' );
				expect( typeof data.props ).toBe( 'object' );
				expect( Array.isArray( data.props ) ).toBe( false );

				if ( testCase.expected.hasColorProp ) {
					expect( data.props ).toHaveProperty( 'color' );
					expect( data.props.color ).toHaveProperty( '$$type', 'color' );
					expect( data.props.color ).toHaveProperty( 'value' );
					if ( testCase.expected.colorValue instanceof RegExp ) {
						expect( data.props.color.value ).toMatch( testCase.expected.colorValue );
					} else {
						expect( data.props.color.value ).toBe( testCase.expected.colorValue );
					}
				}

				expect( data ).not.toHaveProperty( 'unsupported' );
				expect( data ).not.toHaveProperty( 'customCss' );
			} );
		}
	} );

	test( 'should ignore unsupported properties silently', async ( { request } ) => {
		const cssString = 'color: blue; font-size: 16px; margin: 10px;';

		const response = await request.post( '/wp-json/elementor/v1/css-to-atomic', {
			headers: {
				'Content-Type': 'application/json',
				'X-WP-Nonce': apiRequests.nonce,
			},
			data: {
				cssString,
			},
		} );

		expect( response.status() ).toBe( 200 );

		const data = await response.json();

		expect( data ).toHaveProperty( 'props' );
		expect( data.props ).toHaveProperty( 'color' );
		expect( data.props.color ).toHaveProperty( '$$type', 'color' );
		expect( data.props.color.value ).toMatch( /^(blue|#0000ff|rgb\(0,\s*0,\s*255\))$/i );

		expect( data ).not.toHaveProperty( 'unsupported' );
		expect( data ).toHaveProperty( 'customCss' );
		expect( typeof data.customCss ).toBe( 'string' );
		expect( data.customCss ).toContain( 'font-size: 16px' );
		expect( data.customCss ).toContain( 'margin: 10px' );
		expect( Object.keys( data.props ).length ).toBe( 1 );
	} );

	test( 'should add CSS variables to customCss', async ( { request } ) => {
		const cssString = 'color: var(--primary-color);';

		const response = await request.post( '/wp-json/elementor/v1/css-to-atomic', {
			headers: {
				'Content-Type': 'application/json',
				'X-WP-Nonce': apiRequests.nonce,
			},
			data: {
				cssString,
			},
		} );

		expect( response.status() ).toBe( 200 );

		const data = await response.json();

		expect( data ).toHaveProperty( 'props' );
		expect( typeof data.props ).toBe( 'object' );
		expect( Object.keys( data.props ).length ).toBe( 0 );

		expect( data ).not.toHaveProperty( 'unsupported' );
		expect( data ).toHaveProperty( 'customCss' );
		expect( typeof data.customCss ).toBe( 'string' );
		expect( data.customCss ).toBe( 'color: var(--primary-color);' );
	} );

	test( 'should ignore invalid color values silently', async ( { request } ) => {
		const cssString = 'color: not-a-valid-color;';

		const response = await request.post( '/wp-json/elementor/v1/css-to-atomic', {
			headers: {
				'Content-Type': 'application/json',
				'X-WP-Nonce': apiRequests.nonce,
			},
			data: {
				cssString,
			},
		} );

		expect( response.status() ).toBe( 200 );

		const data = await response.json();

		expect( data ).toHaveProperty( 'props' );
		expect( typeof data.props ).toBe( 'object' );
		expect( Object.keys( data.props ).length ).toBe( 0 );

		expect( data ).not.toHaveProperty( 'unsupported' );
		expect( data ).toHaveProperty( 'customCss' );
		expect( typeof data.customCss ).toBe( 'string' );
		expect( data.customCss ).toContain( 'color: not-a-valid-color' );
	} );

	test( 'should handle empty CSS string', async ( { request } ) => {
		const response = await request.post( '/wp-json/elementor/v1/css-to-atomic', {
			headers: {
				'Content-Type': 'application/json',
				'X-WP-Nonce': apiRequests.nonce,
			},
			data: {
				cssString: '',
			},
		} );

		expect( response.status() ).toBe( 200 );

		const data = await response.json();

		expect( data ).toHaveProperty( 'props' );
		expect( typeof data.props ).toBe( 'object' );
		expect( Object.keys( data.props ).length ).toBe( 0 );

		expect( data ).not.toHaveProperty( 'unsupported' );
		expect( data ).not.toHaveProperty( 'customCss' );
	} );

	test( 'should only convert whitelisted color property', async ( { request } ) => {
		const cssString = 'color: red; background-color: blue; border-color: green;';

		const response = await request.post( '/wp-json/elementor/v1/css-to-atomic', {
			headers: {
				'Content-Type': 'application/json',
				'X-WP-Nonce': apiRequests.nonce,
			},
			data: {
				cssString,
			},
		} );

		expect( response.status() ).toBe( 200 );

		const data = await response.json();

		expect( data ).toHaveProperty( 'props' );
		expect( data.props ).toHaveProperty( 'color' );
		expect( data.props.color ).toHaveProperty( '$$type', 'color' );
		expect( data.props.color.value ).toMatch( /^(red|#ff0000|rgb\(255,\s*0,\s*0\))$/i );

		expect( data ).not.toHaveProperty( 'unsupported' );
		expect( data ).toHaveProperty( 'customCss' );
		expect( typeof data.customCss ).toBe( 'string' );
		expect( data.customCss ).toContain( 'background-color: blue' );
		expect( data.customCss ).toContain( 'border-color: green' );
		expect( Object.keys( data.props ).length ).toBe( 1 );
	} );

	test( 'should validate response schema structure', async ( { request } ) => {
		const cssString = 'color: #ff0000; font-size: 16px;';

		const response = await request.post( '/wp-json/elementor/v1/css-to-atomic', {
			headers: {
				'Content-Type': 'application/json',
				'X-WP-Nonce': apiRequests.nonce,
			},
			data: {
				cssString,
			},
		} );

		expect( response.status() ).toBe( 200 );

		const data = await response.json();

		expect( data ).toHaveProperty( 'props' );
		expect( typeof data.props ).toBe( 'object' );
		expect( Array.isArray( data.props ) ).toBe( false );

		if ( Object.keys( data.props ).length > 0 ) {
			const firstProp = Object.values( data.props )[ 0 ] as any;
			expect( firstProp ).toHaveProperty( '$$type' );
			expect( firstProp ).toHaveProperty( 'value' );
		}

		expect( data ).not.toHaveProperty( 'unsupported' );
		expect( data ).toHaveProperty( 'customCss' );
		expect( typeof data.customCss ).toBe( 'string' );
		expect( data.customCss ).toContain( 'font-size: 16px' );
	} );
} );

