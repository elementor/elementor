import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../../parallelTest';
import EditorPage from '../../../../pages/editor-page';
import WpAdminPage from '../../../../pages/wp-admin-page';
import { AtomicHelper } from '../helper';

test.describe( 'Atomic link control dependencies @atomic-widgets @link-dependencies', () => {
	let editor: EditorPage;
	let wpAdmin: WpAdminPage;
	let divBlockId: string;

	test.beforeAll( async ( { browser, apiRequests }, testInfo ) => {
		const page = await browser.newPage();
		wpAdmin = new WpAdminPage( page, testInfo, apiRequests );

		// Enable atomic elements and nested elements experiments
		await wpAdmin.setExperiments( {
			e_opt_in_v4_page: 'active',
			e_atomic_elements: 'active',
		} );

		await wpAdmin.setExperiments( {
			e_nested_elements: 'active',
		} );
		await page.pause();
		editor = await wpAdmin.openNewPage();
	} );

	test.afterAll( async ( { browser } ) => {
		const page = await browser.newPage();
		await wpAdmin.resetExperiments();

		await page.close();
	} );

	test( 'Tag control enabled and disabled based on link value @atomic-widgets', async ( { page, apiRequests }, testInfo ) => {
		const helper = new AtomicHelper( page, editor, wpAdmin );

		if ( ! divBlockId ) {
			divBlockId = await helper.addAtomicElement( 'e-div-block' );
		}

		await editor.openV2PanelTab( 'general' );

		test.step( 'Check tag control is enabled', async () => {
			expect( helper.getHtmlTagControl() ).toHaveText( 'Div' );
			await expect( helper.getHtmlTagControl() ).toBeVisible();
		} );

		await helper.setHtmlTagControl( 'section' );

		test.step( 'Check tag control is disabled when link is set', async () => {
			await helper.setLinkControl( { value: 'https://www.google.com' } );
			await expect( helper.getHtmlTagControl( true ) ).toBeVisible();
		} );

		test.step( 'Validate tag control value is a (link) and tooltip is visible', async () => {
			expect( helper.getHtmlTagControl( true ) ).toHaveText( 'a (link)' );
			await helper.getHtmlTagControl( true ).hover();

			const tooltip = page.locator( ":has-text('The tag is locked to 'a' tag because this Div block has a link. To pick a different tag, remove the link first.')" );

			await tooltip.waitFor();
			await expect( tooltip ).toBeVisible();
			await expect( helper.getHtmlTagControl( true ) ).toHaveCSS( 'cursor', 'not-allowed' );
		} );

		test.step( 'Check tag control is enabled when link is removed', async () => {
			await helper.setLinkControl( { value: '' } );
			await expect( helper.getHtmlTagControl() ).toBeVisible();
		} );

		test.step( 'Validate tag control value is section', async () => {
			expect( helper.getHtmlTagControl() ).toHaveText( 'Section' );
		} );
	} );
} );
