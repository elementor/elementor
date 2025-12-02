import { expect, type Page } from '@playwright/test';
import { parallelTest as test } from '../../../parallelTest';
import WpAdminPage from '../../../pages/wp-admin-page';
import EditorPage from '../../../pages/editor-page';
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

	test.afterEach( async ( { browser } ) => {
		if ( editorPage ) {
			await editorPage.close();
		}
		const page = await browser.newPage();
		await page.close();
	} );

	test( 'Create variables via UI and API, assign to elements, verify frontend', async () => {
		let variableLabel: string;
		let variableId: string;
		let variableValue: string;

		let divBlockId: string;
		let firstHeadingId: string;
		let secondHeadingId: string;

		await test.step( 'Add div block and two heading elements', async () => {
			divBlockId = await editor.addElement( { elType: 'e-div-block' }, 'document' );
			firstHeadingId = await editor.addWidget( { widgetType: 'e-heading', container: divBlockId } );
			secondHeadingId = await editor.addWidget( { widgetType: 'e-heading', container: divBlockId } );
			await editor.page.waitForTimeout( 1000 );

			await editor.page.evaluate( async () => {
				const windowTyped = window as unknown as WindowType;
				const $e = windowTyped.$e;
				await $e.run( 'document/save/draft', {} );
			} );
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

			await editor.page.evaluate( async () => {
				const windowTyped = window as unknown as WindowType;
				const elementor = windowTyped.elementor as unknown as { packages?: { editorVariables?: { service?: { load: () => Promise<unknown> } } } };
				if ( elementor?.packages?.editorVariables?.service ) {
					await elementor.packages.editorVariables.service.load();
				}
			} );

			await editor.waitForPreviewFrame();
			const previewFrame = editor.getPreviewFrame();
			await previewFrame.waitForFunction( ( varName ) => {
				const bodyStyles = window.getComputedStyle( document.body );
				return bodyStyles.getPropertyValue( `--${ varName }` ).trim() !== '';
			}, variableLabel, { timeout: 10000 } );
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

		await test.step( 'Apply variable to the first heading using the editor payload', async () => {
			await editor.waitForPreviewFrame();

			await editor.page.evaluate( async ( { targetId, varId } ) => {
				const windowTyped = window as unknown as WindowType;
				const elementor = windowTyped.elementor as unknown as {
					getContainer: ( id: string ) => { model: { get: ( key: string ) => unknown; set: ( key: string, value: unknown ) => void } } | null;
					files_manager?: { clearCache: () => void };
				};
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

				const variableSetting = {
					$$type: 'global-color-variable',
					value: varId,
				};

				type StyleDefinition = {
					id: string;
					label: string;
					type: string;
					variants: Array<{
						meta: { breakpoint: string; state: string | null };
						props: Record< string, unknown >;
						custom_css: string | null;
					}>;
				};

				const currentStyles = ( container.model.get( 'styles' ) || {} ) as Record< string, StyleDefinition >;
				const localStyle = Object.values( currentStyles ).find( ( style ) => 'local' === style.label );

				let styleId: string;
				if ( localStyle ) {
					styleId = localStyle.id;
					const currentVariants = localStyle.variants || [];
					const desktopVariant = currentVariants.find( ( v ) => 'desktop' === v.meta?.breakpoint && null === v.meta?.state ) || {
						meta: { breakpoint: 'desktop', state: null },
						props: {},
						custom_css: null,
					};

					const updatedVariants = currentVariants.filter( ( v ) => ! ( 'desktop' === v.meta?.breakpoint && null === v.meta?.state ) );
					updatedVariants.push( {
						...desktopVariant,
						props: {
							...desktopVariant.props,
							color: variableSetting,
						},
					} );

					const updatedStyles = {
						...currentStyles,
						[ styleId ]: {
							...localStyle,
							variants: updatedVariants,
						},
					};

					container.model.set( 'styles', updatedStyles );
				} else {
					styleId = `e-${ targetId }-${ Math.random().toString( 36 ).substr( 2, 9 ) }`;
					const newStyle: StyleDefinition = {
						id: styleId,
						label: 'local',
						type: 'class',
						variants: [
							{
								meta: { breakpoint: 'desktop', state: null },
								props: {
									color: variableSetting,
								},
								custom_css: null,
							},
						],
					};

					const updatedStyles = {
						...currentStyles,
						[ styleId ]: newStyle,
					};

					container.model.set( 'styles', updatedStyles );

					const currentClasses = container.model.get( 'settings' ) as { classes?: { $$type: string; value: unknown[] } } | undefined;
					const classesProp = currentClasses?.classes || { $$type: 'classes', value: [] };
					const classesValue = Array.isArray( classesProp.value ) ? classesProp.value : [];
					if ( ! classesValue.includes( styleId ) ) {
						classesValue.push( styleId );
					}

					await $e.run( 'document/elements/settings', {
						container,
						settings: {
							classes: {
								$$type: 'classes',
								value: classesValue,
							},
						},
					} );
				}

				await $e.run( 'document/save/draft', {} );

				if ( elementor.files_manager ) {
					elementor.files_manager.clearCache();
				}

				await $e.run( 'preview/reload', {} );
			}, { targetId: firstHeadingId, varId: variableId } );

			await editor.publishPage();

			await editor.page.waitForFunction( () => {
				const windowTyped = window as unknown as WindowType;
				return typeof windowTyped.elementor !== 'undefined' &&
					typeof windowTyped.$e !== 'undefined' &&
					typeof windowTyped.elementor?.documents?.getCurrent !== 'undefined';
			}, { timeout: 15000 } );

			await editor.waitForPreviewFrame();
			const previewFrame = editor.getPreviewFrame();
			await previewFrame.waitForFunction( ( { selector, expectedColor } ) => {
				const heading = document.querySelector( selector );
				if ( ! heading ) {
					return false;
				}
				const computedColor = window.getComputedStyle( heading ).color;
				return computedColor === expectedColor;
			}, {
				selector: `.elementor-element-${ firstHeadingId } .e-heading-base`,
				expectedColor: 'rgb(0, 0, 0)',
			}, { timeout: 15000 } );
		} );

		await test.step( 'Open variables in the manager and verify the variable is in the list', async () => {
			await editor.waitForPreviewFrame();

			const previewFrame = editor.getPreviewFrame();
			const secondHeading = previewFrame.locator( `.elementor-element-${ secondHeadingId } .e-heading-base` );
			await secondHeading.click();

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

			await editor.page.getByRole( 'button', { name: 'Close' } ).click();
			await editor.page.waitForTimeout( 1000 );
		} );

		await test.step( 'Apply variable to the second heading using the UI', async () => {
			const textColorControl = editor.page.locator( '#text-color-control' );
			const textColorControlVisible = await textColorControl.isVisible( { timeout: 5000 } ).catch( () => false );

			if ( ! textColorControlVisible ) {
				await editor.page.waitForSelector( '[role="tablist"]', { timeout: 10000 } );
				await editor.page.getByRole( 'tab', { name: 'Style' } ).click( { timeout: 10000 } );
				await editor.page.waitForTimeout( 1000 );

				if ( await textColorControl.isHidden() ) {
					const typographyButton = editor.page.getByRole( 'button', { name: 'Typography' } );
					const typographyButtonVisible = await typographyButton.isVisible( { timeout: 2000 } ).catch( () => false );

					if ( typographyButtonVisible ) {
						await typographyButton.click();
						await editor.page.waitForTimeout( 1000 );
					}
				}
			}

			await textColorControl.waitFor( { state: 'visible', timeout: 10000 } );

			const controlBoundingBox = await textColorControl.boundingBox();
			if ( ! controlBoundingBox ) {
				throw new Error( 'Text color control bounding box not found' );
			}

			await editor.page.mouse.move(
				controlBoundingBox.x + ( controlBoundingBox.width / 2 ),
				controlBoundingBox.y + ( controlBoundingBox.height / 2 ),
			);
			await editor.page.waitForTimeout( 1000 );

			const floatingActionBarVisible = await editor.page.locator( EditorSelectors.floatingElements.v4.floatingActionsBar ).isVisible( { timeout: 2000 } ).catch( () => false );

			if ( ! floatingActionBarVisible ) {
				await editor.page.mouse.move(
					controlBoundingBox.x + ( controlBoundingBox.width / 2 ),
					controlBoundingBox.y + ( controlBoundingBox.height / 2 ),
				);
				await editor.page.waitForTimeout( 1000 );
			}

			await editor.page.waitForSelector( EditorSelectors.floatingElements.v4.floatingActionsBar, { timeout: 5000 } );

			const variablesActionButton = editor.page.locator( EditorSelectors.floatingElements.v4.floatingActionsBar ).getByRole( 'button', { name: /Variables/i } );
			await variablesActionButton.waitFor( { state: 'visible', timeout: 5000 } );
			await variablesActionButton.click();
			await editor.page.waitForTimeout( 2000 );

			const variableButton = editor.page.getByLabel( variableLabel ).first();
			await variableButton.waitFor( { state: 'visible', timeout: 10000 } );
			await variableButton.click();
			await editor.page.waitForTimeout( 1000 );

			await editor.page.evaluate( async () => {
				const windowTyped = window as unknown as WindowType;
				const $e = windowTyped.$e;
				await $e.run( 'document/save/draft', {} );
			} );
		} );

		await test.step( 'Assert that the variable is applied to the second heading', async () => {
			await editor.waitForPreviewFrame();

			const previewFrame = editor.getPreviewFrame();
			const secondHeading = previewFrame.locator( `.elementor-element-${ secondHeadingId } .e-heading-base` );
			await expect( secondHeading ).toBeVisible();

			const cssVariableName = `--${ variableLabel }`;
			const expectedColor = 'rgb(0, 0, 0)';

			await previewFrame.waitForFunction( ( { selector, expectedColor: expected } ) => {
				const heading = document.querySelector( selector );
				if ( ! heading ) {
					return false;
				}
				const computedColor = window.getComputedStyle( heading ).color;
				return computedColor === expected;
			}, { selector: `.elementor-element-${ secondHeadingId } .e-heading-base`, expectedColor }, { timeout: 10000 } );

			const computedColor = await secondHeading.evaluate( ( el ) => {
				return window.getComputedStyle( el ).color;
			} );

			expect( computedColor, `Second heading color should be ${ expectedColor }` ).toBe( expectedColor );

			const rootVariable = await previewFrame.evaluate( ( varName ) => {
				const bodyStyles = window.getComputedStyle( document.body );
				return bodyStyles.getPropertyValue( varName ).trim();
			}, cssVariableName );

			expect( rootVariable, `CSS variable ${ cssVariableName } should be defined` ).toBe( variableValue );
		} );

		await test.step( 'Assert that the variable is applied to the first heading', async () => {
			await editor.waitForPreviewFrame();

			const previewFrame = editor.getPreviewFrame();
			const firstHeading = previewFrame.locator( `.elementor-element-${ firstHeadingId } .e-heading-base` );
			await expect( firstHeading ).toBeVisible();

			const cssVariableName = `--${ variableLabel }`;
			const expectedColor = 'rgb(0, 0, 0)';

			await previewFrame.waitForFunction( ( { selector, expectedColor: expected } ) => {
				const heading = document.querySelector( selector );
				if ( ! heading ) {
					return false;
				}
				const computedColor = window.getComputedStyle( heading ).color;
				return computedColor === expected;
			}, { selector: `.elementor-element-${ firstHeadingId } .e-heading-base`, expectedColor }, { timeout: 10000 } );

			const computedColor = await firstHeading.evaluate( ( el ) => {
				return window.getComputedStyle( el ).color;
			} );

			expect( computedColor, `First heading color should be ${ expectedColor }` ).toBe( expectedColor );

			const rootVariable = await previewFrame.evaluate( ( varName ) => {
				const bodyStyles = window.getComputedStyle( document.body );
				return bodyStyles.getPropertyValue( varName ).trim();
			}, cssVariableName );

			expect( rootVariable, `CSS variable ${ cssVariableName } should be defined` ).toBe( variableValue );
		} );
	} );
} );
