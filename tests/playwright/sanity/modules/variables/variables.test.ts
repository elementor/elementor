import { expect, type Page } from '@playwright/test';
import { parallelTest as test } from '../../../parallelTest';
import WpAdminPage from '../../../pages/wp-admin-page';
import EditorPage from '../../../pages/editor-page';
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
		let variableId: string;
		let variableLabel: string;

		await test.step( 'Create variable via API', async () => {
			const nonce = await editor.page.evaluate( () => {
				return ( window as WindowType ).wpApiSettings?.nonce;
			} );

			variableLabel = `color-variable-created-with-api-${ Date.now() }`;

			const response = await editor.page.request.post( '/wp-json/elementor/v1/variables/create', {
				headers: {
					'Content-Type': 'application/json',
					'X-WP-Nonce': nonce,
				},
				data: {
					type: 'global-color-variable',
					label: variableLabel,
					value: '#000000',
				},
			} );

			expect( response.ok() ).toBeTruthy();
			const responseData = await response.json();
			expect( responseData.success ).toBeTruthy();

			variableId = responseData.data.variable.id;

			await editor.page.reload();
			await editor.page.waitForLoadState( 'load' );
			await editor.page.waitForSelector( '#elementor-loading', { state: 'hidden' } );

			await editor.page.waitForFunction( () => {
				const windowTyped = window as unknown as WindowType;
				return typeof windowTyped.elementor !== 'undefined' &&
					typeof windowTyped.elementor?.documents?.getCurrent !== 'undefined';
			}, { timeout: 15000 } );

			await editor.page.waitForTimeout( 3000 );

			const variablesCount = await editor.page.evaluate( async () => {
				const nonce = ( window as unknown as WindowType ).wpApiSettings?.nonce;
				if ( ! nonce ) {
					return { error: 'Nonce not found' };
				}

				const response = await fetch( '/wp-json/elementor/v1/variables/list', {
					method: 'GET',
					headers: {
						'X-WP-Nonce': nonce,
					},
					credentials: 'include',
				} );

				if ( ! response.ok ) {
					return { error: `API failed: ${ response.status }` };
				}

				const data = await response.json();
				return {
					success: data.success,
					count: data.success && data.data?.variables ? Object.keys( data.data.variables ).length : 0,
					variables: data.success && data.data?.variables ? Object.keys( data.data.variables ) : [],
				};
			} );

			console.log( 'Variables available via API:', JSON.stringify( variablesCount, null, 2 ) );

			await editor.page.waitForFunction( () => {
				const windowTyped = window as unknown as WindowType;
				return typeof windowTyped.$e !== 'undefined' &&
					windowTyped.$e?.components?.get !== undefined;
			}, { timeout: 10000 } );

			await editor.page.evaluate( async () => {
				const windowTyped = window as unknown as WindowType;
				const $e = windowTyped.$e;

				if ( ! $e || ! $e.components ) {
					throw new Error( '$e or components not available' );
				}

				const variablesComponent = $e.components.get( 'variables' );
				if ( ! variablesComponent || ! variablesComponent.service ) {
					throw new Error( 'Variables component not found' );
				}

				if ( typeof variablesComponent.service.load === 'function' ) {
					await variablesComponent.service.load();
				}
			} );

			await editor.page.waitForTimeout( 1000 );
		} );

		let secondHeadingId: string;

		await test.step( 'Add two heading elements', async () => {
			await editor.addWidget( { widgetType: 'e-heading' } );
			secondHeadingId = await editor.addWidget( { widgetType: 'e-heading' } );
			await editor.page.waitForTimeout( 1000 );
		} );

		await test.step( 'Assign API variable to second heading', async () => {
			await editor.page.waitForTimeout( 1000 );

			const previewInfo = await editor.page.evaluate( async ( { targetId, varId, varLabel } ) => {
				const windowTyped = window as unknown as WindowType;
				const elementor = windowTyped.elementor;
				const $e = windowTyped.$e;

				if ( ! elementor || ! elementor.getContainer ) {
					throw new Error( 'Elementor instance not found' );
				}

				if ( ! $e || ! $e.run ) {
					throw new Error( '$e instance not found' );
				}

				const container = elementor.getContainer( targetId );

				if ( ! container || ! container.model ) {
					throw new Error( `Container with ID ${ targetId } not found` );
				}

				const variablesComponent = $e.components.get( 'variables' );
				const variablesBefore = variablesComponent?.service?.variables() || {};

				await $e.run( 'document/elements/select', {
					container,
				} );

				await new Promise( ( resolve ) => setTimeout( resolve, 500 ) );

				const variableSetting = {
					$$type: 'global-color-variable',
					value: varId,
				};

				await $e.run( 'document/elements/settings', {
					container,
					settings: {
						title_color: variableSetting,
					},
				} );

				const savedSettings = container.settings.get( 'title_color' );

				if ( elementor.reloadPreview ) {
					elementor.reloadPreview();
					await new Promise( ( resolve ) => {
						elementor.once( 'preview:loaded', resolve );
						setTimeout( resolve, 5000 );
					} );
				} else {
					await new Promise( ( resolve ) => setTimeout( resolve, 2000 ) );
				}

				const previewDocument = elementor.getPreviewContainer()?.contentWindow?.document;
				const previewHeading = previewDocument?.querySelector( `.elementor-element-${ targetId } .e-heading-base` );
				const previewComputedColor = previewHeading ? previewDocument.defaultView?.getComputedStyle( previewHeading ).color : null;
				const previewInlineStyle = previewHeading?.getAttribute( 'style' ) || '';

				const variablesAfter = variablesComponent?.service?.variables() || {};

				return {
					savedSettings,
					variablesBefore: Object.keys( variablesBefore ),
					variablesAfter: Object.keys( variablesAfter ),
					hasVariable: varId in variablesAfter,
					previewComputedColor,
					previewInlineStyle,
					varId,
					varLabel,
				};
			}, { targetId: secondHeadingId, varId: variableId, varLabel: variableLabel } );

			console.log( 'Preview info after assignment:', JSON.stringify( previewInfo, null, 2 ) );

			await editor.page.evaluate( async () => {
				const windowTyped = window as unknown as WindowType;
				const $e = windowTyped.$e;
				await $e.run( 'document/save/draft', {} );
			} );

			await editor.page.waitForTimeout( 2000 );
		} );

		await test.step( 'Publish and view the page', async () => {
			await editor.publishAndViewPage();
			await editor.page.waitForTimeout( 2000 );
			await editor.page.reload();
			await editor.page.waitForLoadState( 'networkidle' );
		} );

		await test.step( 'Verify second heading uses API variable', async () => {
			const secondHeading = editor.page.locator( '.e-heading-base' ).nth( 1 );
			await expect( secondHeading ).toBeVisible();

			const cssVariableName = `--${ variableLabel }`;

			const rootVariable = await editor.page.evaluate( ( varName ) => {
				return window.getComputedStyle( document.documentElement ).getPropertyValue( varName );
			}, cssVariableName );

			expect( rootVariable.trim() ).toBe( '#000000' );

			const inlineStyle = await secondHeading.evaluate( ( el ) => {
				return el.getAttribute( 'style' ) || '';
			} );

			expect( inlineStyle ).toContain( `var(${ cssVariableName })` );

			const computedColor = await secondHeading.evaluate( ( el ) => {
				return window.getComputedStyle( el ).color;
			} );

			expect( computedColor ).toBe( 'rgb(0, 0, 0)' );
		} );
	} );
} );
