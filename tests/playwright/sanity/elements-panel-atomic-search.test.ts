import { expect } from '@playwright/test';
import { parallelTest as test } from '../parallelTest';
import WpAdminPage from '../pages/wp-admin-page';

test.describe( 'Elements panel search — atomic priority @atomic-widgets', () => {
	test( 'V4 atomic elements appear before V3 widgets in search results when e_atomic_elements is active', async ( { page, apiRequests }, testInfo ) => {
		// Arrange — e_atomic_elements is active by default for new sites (new_site.default_active: true)
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = await wpAdmin.openNewPage();
		await editor.openElementsPanel();

		// Debug — verify preconditions before searching
		const debug = await page.evaluate( () => {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const win = window as unknown as Record<string, any>;
			const eHeading = win.elementor?.widgetsCache?.[ 'e-heading' ];
			return {
				atomic: eHeading?.atomic,
				hasAtomicPropsSchema: !! eHeading?.atomic_props_schema,
				eAtomicExp: win.elementorCommon?.config?.experimentalFeatures?.e_atomic_elements,
			};
		} );
		// eslint-disable-next-line no-console
		console.log( '[atomic-search-debug]', JSON.stringify( debug ) );

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
