import { expect } from '@playwright/test';
import { parallelTest as test } from '../parallelTest';
import WpAdminPage from '../pages/wp-admin-page';

test.describe( 'Elements panel search — atomic priority @atomic-widgets', () => {
	test( 'V4 atomic elements appear before V3 widgets in search results when e_atomic_elements is active', async ( { page, apiRequests }, testInfo ) => {
		// Arrange — e_atomic_elements is active by default for new sites (new_site.default_active: true)
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
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
