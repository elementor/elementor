import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../../parallelTest';
import WpAdminPage from '../../../../pages/wp-admin-page';
import { AtomicHelper, ElementType } from '../helper';

test.describe( 'Atomic link control dependencies @atomic-widgets @link-dependencies', () => {
	const tests: { label: string, elementType: ElementType }[] = [
		{ label: 'Div block', elementType: 'e-div-block' },
		{ label: 'Flexbox', elementType: 'e-flexbox' },
	];

	test.beforeAll( async ( { browser, apiRequests }, testInfo ) => {
		const page = await browser.newPage();
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );

		await wpAdmin.setExperiments( {
			e_opt_in_v4_page: 'active',
			e_atomic_elements: 'active',
		} );
	} );

	test.afterAll( async ( { browser, apiRequests }, testInfo ) => {
		const page = await browser.newPage();
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );

		await wpAdmin.resetExperiments();
		await page.close();
	} );

	for ( const { label, elementType } of tests ) {
		test( `${ label } - link control - tag and new tab switch dependencies`, async ( { page, apiRequests }, testInfo ) => {
			const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
			const editor = await wpAdmin.openNewPage();
			const helper = new AtomicHelper( page, editor, wpAdmin );

			await helper.addAtomicElement( elementType );
			await editor.v4Panel.openTab( 'general' );

			await test.step( 'Check tag control is enabled', async () => {
				expect( await helper.isHtmlTagControlDisabled() ).toBeFalsy();
			} );

			await test.step( 'Check tag control is disabled when link is set', async () => {
				await helper.setHtmlTagControl( 'section' );
				await helper.setLinkControl( { value: 'https://www.google.com', isTargetBlank: true } );

				expect( await helper.isHtmlTagControlDisabled() ).toBeTruthy();
			} );

			await test.step( 'Validate tag control value is a (link) and tooltip is visible', async () => {
				const disabledTagControl = helper.getHtmlTagControl( '.MuiInputBase-root' );
				const tooltip = page.locator( '.MuiAlert-content' );

				expect( await disabledTagControl.innerText() ).toMatch( /a \(link\)/i );

				await disabledTagControl.hover();
				await tooltip.waitFor();

				expect( await tooltip.innerText() ).toMatch( `The tag is locked to \'a\' tag because this ${ label } has a link. To pick a different tag, remove the link first.` );
			} );

			await test.step( 'Validate not-allowed as cursor', async () => {
				await expect( helper.getHtmlTagControl( '[role="combobox"]' ) ).toHaveCSS( 'cursor', 'not-allowed' );
			} );

			await test.step( 'Assert new tab switch is disabled', async () => {
				expect( await helper.isNewTabSwitchOn() ).toBeTruthy();
			} );

			await test.step( 'Check tag control is enabled and new tab switch is back on after link is removed', async () => {
				await helper.setLinkControl( { value: '' } );

				expect( await helper.isHtmlTagControlDisabled() ).toBeFalsy();
				expect( await helper.isNewTabSwitchOn() ).toBeFalsy();
			} );
		} );
	}
} );
