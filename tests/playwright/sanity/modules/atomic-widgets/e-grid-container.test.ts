import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../parallelTest';
import WpAdminPage from '../../../pages/wp-admin-page';
import { getElementSelector } from '../../../assets/elements-utils';
import EditorSelectors from '../../../selectors/editor-selectors';

test.describe( 'Atomic Grid container @atomic-widgets @e-grid', () => {
	test.beforeAll( async ( { browser, apiRequests }, testInfo ) => {
		const page = await browser.newPage();
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );

		await wpAdmin.setExperiments( {
			e_opt_in_v4_page: 'active',
			e_atomic_elements: 'active',
			e_atomic_grid_control: 'active',
		} );
		await page.close();
	} );

	test.afterAll( async ( { browser, apiRequests }, testInfo ) => {
		const page = await browser.newPage();
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );

		await wpAdmin.resetExperiments();
		await page.close();
	} );

	test( 'Grid container renders in canvas with base class and accepts a widget child', async ( { page, apiRequests }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = await wpAdmin.openNewPage();

		const gridId = await editor.addElement( { elType: EditorSelectors.v4.atoms.grid }, 'document' );

		const gridRoot = editor.previewFrame.locator( getElementSelector( gridId ) );
		await expect( gridRoot ).toHaveAttribute( 'data-element_type', 'e-grid' );
		await expect( gridRoot ).toHaveClass( /e-grid-base/ );

		const headingId = await editor.addWidget( { widgetType: 'e-heading', container: gridId } );
		const heading = editor.previewFrame.locator( getElementSelector( headingId ) );
		await expect( heading ).toBeVisible();

		const headingParent = await heading.evaluate( ( node ) =>
			node.closest( '.elementor-element' )?.parentElement?.closest( '.e-con' )?.getAttribute( 'data-id' ),
		);
		expect( headingParent ).toBe( gridId );
	} );

	test( 'Grid container Style tab shows layout section when selected', async ( { page, apiRequests }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = await wpAdmin.openNewPage();

		const gridId = await editor.addElement( { elType: 'e-grid' }, 'document' );
		await editor.selectElement( gridId );
		await editor.v4Panel.openTab( 'style' );
		await editor.openV2Section( 'layout' );

		await expect( editor.page.getByRole( 'button', { name: 'Grid', exact: true } ) ).toBeVisible();
	} );

	test( 'Grid layout exposes dimension matrix and expandable grid settings', async ( { page, apiRequests }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = await wpAdmin.openNewPage();

		const gridId = await editor.addElement( { elType: 'e-grid' }, 'document' );
		await editor.selectElement( gridId );
		await editor.v4Panel.openTab( 'style' );
		await editor.openV2Section( 'layout' );

		await editor.page.getByRole( 'button', { name: 'Grid', exact: true } ).click();

		await expect( editor.page.getByRole( 'grid', { name: 'Grid dimensions' } ) ).toBeVisible();

		await editor.page.getByRole( 'button', { name: 'Open grid settings' } ).click();

		await expect( editor.page.getByText( 'Gaps', { exact: true } ).first() ).toBeVisible();
		await expect( editor.page.getByText( 'Justify items', { exact: true } ).first() ).toBeVisible();
	} );
} );
