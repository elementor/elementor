import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../parallelTest';
import WpAdminPage from '../../../pages/wp-admin-page';
import EditorPage from '../../../pages/editor-page';
import VariablesManagerPage from '../../v4-tests/editor-variables/variables-manager-page';
import EditorSelectors from '../../../selectors/editor-selectors';

test.describe( 'Variables Module @variables', () => {
	let editor: EditorPage;
	let variablesManagerPage: VariablesManagerPage;

	test.beforeEach( async ( { browser, apiRequests }, testInfo ) => {
		const page = await browser.newPage();
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );

		await wpAdmin.setExperiments( {
			e_opt_in_v4_page: 'active',
			e_atomic_elements: 'active',
			e_variables: 'active',
			e_variables_manager: 'active',
		} );

		editor = await wpAdmin.openNewPage();
		variablesManagerPage = new VariablesManagerPage( page );
	} );

	test.afterEach( async ( { browser, apiRequests }, testInfo ) => {
		const page = await browser.newPage();
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		await wpAdmin.resetExperiments();
		await page.close();
	} );

	test( 'Create variables via UI and API, assign to elements, verify frontend', async ( { page, request } ) => {
		await test.step( 'Create variable via UI', async () => {
			await variablesManagerPage.createVariableFromManager( {
				name: 'color-variable-created-inside-ui',
				value: '#ffffff',
				type: 'color',
			} );
		} );

		await test.step( 'Create variable via API', async () => {
			const nonce = await page.evaluate( () => {
				return ( window as any ).wpApiSettings?.nonce;
			} );

			const response = await request.post( '/wp-json/elementor/v1/variables/create', {
				headers: {
					'Content-Type': 'application/json',
					'X-WP-Nonce': nonce,
				},
				data: {
					type: 'global-color-variable',
					label: 'color-variable-created-with-api',
					value: '#000000',
				},
			} );

			expect( response.ok() ).toBeTruthy();
			const responseData = await response.json();
			expect( responseData.success ).toBeTruthy();

			await page.reload();
		} );

		await test.step( 'Add two heading elements', async () => {
			await editor.addElement( { elType: 'e-heading' }, 'document' );
			await editor.addElement( { elType: 'e-heading' }, 'document' );
		} );

		await test.step( 'Assign UI variable to first heading', async () => {
			const firstHeading = editor.getPreviewFrame().locator( '.e-heading-base' ).first();
			await firstHeading.click();

			await page.getByRole( 'tab', { name: 'Style' } ).click();
			const textColorControl = page.locator( '#text-color-control' );
			const controlBoundingBox = await textColorControl.boundingBox();
			await page.mouse.move( controlBoundingBox.x + ( controlBoundingBox.width / 2 ), controlBoundingBox.y + ( controlBoundingBox.height / 2 ) );
			await page.click( EditorSelectors.floatingElements.v4.floatingActionsBar );
			await page.getByRole( 'button', { name: 'color-variable-created-inside-ui' } ).click();
		} );

		await test.step( 'Assign API variable to second heading', async () => {
			const secondHeading = editor.getPreviewFrame().locator( '.e-heading-base' ).nth( 1 );
			await secondHeading.click();

			await page.getByRole( 'tab', { name: 'Style' } ).click();
			const textColorControl = page.locator( '#text-color-control' );
			const controlBoundingBox = await textColorControl.boundingBox();
			await page.mouse.move( controlBoundingBox.x + ( controlBoundingBox.width / 2 ), controlBoundingBox.y + ( controlBoundingBox.height / 2 ) );
			await page.click( EditorSelectors.floatingElements.v4.floatingActionsBar );
			await page.getByRole( 'button', { name: 'color-variable-created-with-api' } ).click();
		} );

		await test.step( 'Publish and view the page', async () => {
			await editor.publishAndViewPage();
		} );

		await test.step( 'Verify first heading uses UI variable', async () => {
			const firstHeading = page.locator( '.e-heading-base' ).first();
			await expect( firstHeading ).toBeVisible();

			const computedColor = await firstHeading.evaluate( ( el ) => {
				return window.getComputedStyle( el ).color;
			} );

			expect( computedColor ).toBe( 'rgb(255, 255, 255)' );

			const rootVariable = await page.evaluate( () => {
				return window.getComputedStyle( document.documentElement ).getPropertyValue( '--color-variable-created-inside-ui' );
			} );

			expect( rootVariable.trim() ).toBe( '#ffffff' );

			const inlineStyle = await firstHeading.evaluate( ( el ) => {
				return el.getAttribute( 'style' ) || '';
			} );

			expect( inlineStyle ).toContain( 'var(--color-variable-created-inside-ui)' );
		} );

		await test.step( 'Verify second heading uses API variable', async () => {
			const secondHeading = page.locator( '.e-heading-base' ).nth( 1 );
			await expect( secondHeading ).toBeVisible();

			const computedColor = await secondHeading.evaluate( ( el ) => {
				return window.getComputedStyle( el ).color;
			} );

			expect( computedColor ).toBe( 'rgb(0, 0, 0)' );

			const rootVariable = await page.evaluate( () => {
				return window.getComputedStyle( document.documentElement ).getPropertyValue( '--color-variable-created-with-api' );
			} );

			expect( rootVariable.trim() ).toBe( '#000000' );

			const inlineStyle = await secondHeading.evaluate( ( el ) => {
				return el.getAttribute( 'style' ) || '';
			} );

			expect( inlineStyle ).toContain( 'var(--color-variable-created-with-api)' );
		} );
	} );
} );

