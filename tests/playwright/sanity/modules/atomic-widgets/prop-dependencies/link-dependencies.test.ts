import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../../parallelTest';
import EditorPage from '../../../../pages/editor-page';
import WpAdminPage from '../../../../pages/wp-admin-page';
import { AtomicHelper } from '../helper';

test.describe( 'Atomic link control dependencies @atomic-widgets', () => {
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

	test( 'Tag control enabled and disabled based on link value @atomic-widgets', async ( { page } ) => {
		const helper = new AtomicHelper( page, editor, wpAdmin );

		if ( ! divBlockId ) {
			divBlockId = await helper.addAtomicElement( 'e-div-block' );
		}

		await editor.openV2PanelTab( 'general' );

		test.step( 'Check tag control is enabled', async () => {
			expect( helper.getHtmlTagControl() ).toHaveValue( 'div' );
			expect( await helper.getHtmlTagControl().isDisabled() ).toBeFalsy();
		} );

		await helper.setHtmlTagControl( 'section' );

		test.step( 'Check tag control is disabled when link is set', async () => {
			await helper.setLinkControl( { value: 'https://www.google.com' } );
			expect( await helper.getHtmlTagControl().isDisabled() ).toBeTruthy();
		} );

		test.step( 'Validate tag control value is a (link)', async () => {
			expect( helper.getHtmlTagControl() ).toHaveValue( 'a' );
		} );

		test.step( 'Check tag control is enabled when link is removed', async () => {
			await helper.setLinkControl( { value: '' } );
			expect( await helper.getHtmlTagControl().isDisabled() ).toBeFalsy();
		} );

		test.step( 'Validate tag control value is section', async () => {
			expect( helper.getHtmlTagControl() ).toHaveValue( 'section' );
		} );
	} );
} );
