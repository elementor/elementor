import { test, expect } from '@playwright/test';

test( 'Debug API Response', async ( { request } ) => {
	const htmlContent = `
		<style>
			.first.second {
				color: red;
				font-size: 16px;
			}
		</style>
		<div class="first second">Test</div>
	`;

	const response = await request.post( '/wp-json/elementor/v1/widgets/convert-html', {
		headers: {
			'X-DEV-TOKEN': 'my-dev-token',
			'Content-Type': 'application/json',
		},
		data: {
			html: htmlContent,
			createGlobalClasses: true,
		},
	} );

	const apiResult = await response.json();

	console.log( 'API RESPONSE:', JSON.stringify( apiResult, null, 2 ) );
	console.log( 'compound_classes_created:', apiResult.compound_classes_created );
	console.log( 'compound_classes:', apiResult.compound_classes );

	expect( response.ok() ).toBe( true );
} );

