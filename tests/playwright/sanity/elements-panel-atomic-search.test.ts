import { expect } from '@playwright/test';
import { parallelTest as test } from '../parallelTest';
import WpAdminPage from '../pages/wp-admin-page';

test.describe( 'Elements panel search — atomic priority @atomic-widgets', () => {
	test.afterAll( async ( { browser, apiRequests }, testInfo ) => {
		const context = await browser.newContext();
		const page = await context.newPage();
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		await wpAdmin.resetExperiments();
		await context.close();
	} );

	test( 'V4 atomic elements appear before V3 widgets in search results when e_atomic_elements is active', async ( { page, apiRequests }, testInfo ) => {
		// Arrange
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		await wpAdmin.setExperiments( { e_atomic_elements: 'active' } );

		const editor = await wpAdmin.openNewPage();
		await editor.openElementsPanel();

		// Act — search for "heading" which matches both e-heading (V4) and Heading (V3)
		await page.locator( '#elementor-panel-elements-search-wrapper input' ).fill( 'heading' );

		// Assert — e-heading appears before the legacy heading in DOM order
		const panelItems = page.locator( '#elementor-panel-elements .elementor-element[data-library-element-type]' );
		await panelItems.first().waitFor();

		const elementTypes = await panelItems.evaluateAll( ( els ) =>
			els.map( ( el ) => ( el as HTMLElement ).dataset.libraryElementType ?? '' ),
		);

		const v4HeadingIndex = elementTypes.indexOf( 'e-heading' );
		const v3HeadingIndex = elementTypes.indexOf( 'heading' );

		expect( v4HeadingIndex ).toBeGreaterThanOrEqual( 0 );
		expect( v3HeadingIndex ).toBeGreaterThanOrEqual( 0 );
		expect( v4HeadingIndex ).toBeLessThan( v3HeadingIndex );
	} );
} );
