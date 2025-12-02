import { expect, type Page } from '@playwright/test';
import { parallelTest as test } from '../../../parallelTest';
import WpAdminPage from '../../../pages/wp-admin-page';
import EditorPage from '../../../pages/editor-page';
import VariablesManagerPage from '../v4-tests/editor-variables/variables-manager-page';
import EditorSelectors from '../../../selectors/editor-selectors';
import type { WindowType } from '../../../types/types';

test.describe( 'Variables Module @variables', () => {
	let editor: EditorPage;
	let editorPage: Page;

	test.beforeEach( async ( { browser, apiRequests }, testInfo ) => {
		editorPage = await browser.newPage();
		const wpAdmin = new WpAdminPage( editorPage, testInfo, apiRequests );

		await wpAdmin.setExperiments( {
			e_opt_in_v4_page: 'active',
			e_atomic_elements: 'active',
			e_variables: 'active',
		} );

		await wpAdmin.setExperiments( {
			e_variables_manager: 'active',
		} );

		editor = await wpAdmin.openNewPage();
	} );

	test.afterEach( async ( { browser, apiRequests }, testInfo ) => {
		if ( editorPage ) {
			await editorPage.close();
		}
		const page = await browser.newPage();
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		// Await wpAdmin.resetExperiments();
		await page.close();
	} );

	test( 'Create variables via UI and API, assign to elements, verify frontend', async () => {
		let variableLabel: string;
		let variableId: string;
		let variableValue: string;

		let divBlockId: string;
		let secondHeadingId: string;

		await test.step( 'Add div block and two heading elements', async () => {
			divBlockId = await editor.addElement( { elType: 'e-div-block' }, 'document' );
			await editor.addWidget( { widgetType: 'e-heading', container: divBlockId } );
			secondHeadingId = await editor.addWidget( { widgetType: 'e-heading', container: divBlockId } );
			await editor.page.waitForTimeout( 1000 );
		} );

		await test.step( 'Remove existing variables with the API', async () => {
			const nonce = await editor.page.evaluate( () => {
				return ( window as WindowType ).wpApiSettings?.nonce;
			} );

			const listResponse = await editor.page.request.get( '/wp-json/elementor/v1/variables/list', {
				headers: {
					'X-WP-Nonce': nonce,
				},
			} );

			expect( listResponse.ok() ).toBeTruthy();
			const listData = await listResponse.json();

			if ( listData.success && listData.data?.variables ) {
				const variables = listData.data.variables;

				for ( const [ id, variable ] of Object.entries( variables ) ) {
					const varData = variable as { deleted?: boolean; deleted_at?: string };
					if ( ! varData.deleted && ! varData.deleted_at ) {
						const deleteResponse = await editor.page.request.post( '/wp-json/elementor/v1/variables/delete', {
							headers: {
								'Content-Type': 'application/json',
								'X-WP-Nonce': nonce,
							},
							data: {
								id,
							},
						} );

						expect( deleteResponse.ok() ).toBeTruthy();
						const deleteData = await deleteResponse.json();
						expect( deleteData.success ).toBeTruthy();
					}
				}
			}
		} );

		await test.step( 'Create variable with the API', async () => {
			const nonce = await editor.page.evaluate( () => {
				return ( window as WindowType ).wpApiSettings?.nonce;
			} );

			variableLabel = `color-variable-created-with-api`;
			variableValue = '#000000';

			const response = await editor.page.request.post( '/wp-json/elementor/v1/variables/create', {
				headers: {
					'Content-Type': 'application/json',
					'X-WP-Nonce': nonce,
				},
				data: {
					type: 'global-color-variable',
					label: variableLabel,
					value: variableValue,
				},
			} );

			expect( response.ok() ).toBeTruthy();
			const responseData = await response.json();
			expect( responseData.success ).toBeTruthy();
			expect( responseData.data ).toBeDefined();
			expect( responseData.data.variable ).toBeDefined();

			variableId = responseData.data.variable.id;
			expect( variableId ).toBeTruthy();
			expect( responseData.data.variable.label ).toBe( variableLabel );
			expect( responseData.data.variable.value ).toBe( variableValue );

			await editor.page.reload();
			await editor.page.waitForLoadState( 'load' );
			await editor.page.waitForSelector( '#elementor-loading', { state: 'hidden' } );

			await editor.page.waitForFunction( () => {
				const windowTyped = window as unknown as WindowType;
				return typeof windowTyped.elementor !== 'undefined' &&
					typeof windowTyped.$e !== 'undefined' &&
					typeof windowTyped.elementor?.documents?.getCurrent !== 'undefined';
			}, { timeout: 15000 } );
		} );

		await test.step( 'List variables via the API and verify the variable is created', async () => {
			const nonce = await editor.page.evaluate( () => {
				return ( window as WindowType ).wpApiSettings?.nonce;
			} );

			const listResponse = await editor.page.request.get( '/wp-json/elementor/v1/variables/list', {
				headers: {
					'X-WP-Nonce': nonce,
				},
			} );

			expect( listResponse.ok() ).toBeTruthy();
			const listData = await listResponse.json();
			expect( listData.success ).toBeTruthy();
			expect( listData.data ).toBeDefined();
			expect( listData.data.variables ).toBeDefined();

			const variables = listData.data.variables;
			expect( variables[ variableId ] ).toBeDefined();

			const createdVariable = variables[ variableId ];
			expect( createdVariable.label ).toBe( variableLabel );
			expect( createdVariable.value ).toBe( variableValue );
			expect( createdVariable.type ).toBe( 'global-color-variable' );
		} );

		await test.step( 'Open variables in the manager and verify the variable is in the list', async () => {
			await editor.waitForPreviewFrame();

			const tempHeadingId = await editor.addWidget( { widgetType: 'e-heading' }, 'document' );
			await editor.page.waitForTimeout( 1000 );

			const previewFrame = editor.getPreviewFrame();
			const tempHeading = previewFrame.locator( `.elementor-element-${ tempHeadingId } .e-heading-base` );
			await tempHeading.click();

			await editor.page.waitForSelector( '[role="tablist"]', { timeout: 10000 } );
			await editor.page.getByRole( 'tab', { name: 'Style' } ).click();

			const textColorControl = editor.page.locator( '#text-color-control' );
			if ( await textColorControl.isHidden() ) {
				await editor.page.getByRole( 'button', { name: 'Typography' } ).click();
			}

			const controlBoundingBox = await textColorControl.boundingBox();
			if ( controlBoundingBox ) {
				await editor.page.mouse.move(
					controlBoundingBox.x + ( controlBoundingBox.width / 2 ),
					controlBoundingBox.y + ( controlBoundingBox.height / 2 ),
				);
				await editor.page.waitForTimeout( 1000 );
			}

			await editor.page.waitForSelector( EditorSelectors.floatingElements.v4.floatingActionsBar, { timeout: 5000 } );
			await editor.page.click( EditorSelectors.floatingElements.v4.floatingActionsBar );
			await editor.page.waitForTimeout( 500 );
			await editor.page.click( EditorSelectors.variables.manager.managerButton );
			await editor.page.waitForTimeout( 2000 );

			const variableRow = editor.page.locator( 'tbody tr', { hasText: variableLabel } );
			await expect( variableRow ).toBeVisible( { timeout: 10000 } );
			await expect( variableRow.getByText( variableValue ) ).toBeVisible();
		} );
	} );
} );
