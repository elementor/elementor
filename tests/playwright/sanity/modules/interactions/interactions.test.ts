import { expect, type Page } from '@playwright/test';
import { parallelTest as test } from '../../../parallelTest';
import WpAdminPage from '../../../pages/wp-admin-page';
import EditorPage from '../../../pages/editor-page';
import type { WindowType, ElementorElement } from '../../../types/types';

test.describe( 'Interactions Module @interactions', () => {
	let editor: EditorPage;
	let editorPage: Page;

	test.beforeEach( async ( { browser, apiRequests }, testInfo ) => {
		editorPage = await browser.newPage();
		const wpAdmin = new WpAdminPage( editorPage, testInfo, apiRequests );

		await wpAdmin.setExperiments( {
			e_opt_in_v4_page: 'active',
			e_atomic_elements: 'active',
			e_interactions: 'active',
		} );

		editor = await wpAdmin.openNewPage();
	} );

	test.afterEach( async ( { browser, apiRequests }, testInfo ) => {
		if ( editorPage ) {
			await editorPage.close();
		}

		const page = await browser.newPage();
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		await wpAdmin.resetExperiments();
		await page.close();
	} );

	test( 'Add interaction via UI controls', async () => {
		const headingId = await editor.addWidget( { widgetType: 'e-heading' } );

		const headingSelector = editor.getWidgetSelector( headingId );
		const headingInPreview = editor.getPreviewFrame().locator( headingSelector );
		await headingInPreview.waitFor( { state: 'visible' } );
		await editor.selectElement( headingId );

		await editor.page.getByRole( 'tab', { name: 'Interactions' } ).click();
		await editor.page.getByRole( 'button', { name: 'Create an interaction' } ).click();
		await editor.page.waitForSelector( '.MuiPopover-root' );

		await editor.page.getByText( 'Page load', { exact: true } ).click();
		await editor.page.getByRole( 'option', { name: 'Page load' } ).click();
		await editor.page.getByText( 'Fade', { exact: true } ).click();
		await editor.page.getByRole( 'option', { name: 'Fade' } ).click();
		await editor.page.locator( 'body' ).click();

		await expect( editor.page.locator( '.MuiTag-root' ).first() ).toBeVisible();

		await editor.page.waitForTimeout( 1000 );

		await editor.publishAndViewPage();

		const headingElement = editor.page.locator( '.e-heading-base' ).first();
		await expect( headingElement ).toBeVisible();
		await expect( headingElement ).toHaveAttribute( 'data-interactions' );

		const interactionsData = await headingElement.getAttribute( 'data-interactions' );
		expect( interactionsData ).toBeTruthy();

		const interactionsArray = JSON.parse( interactionsData );
		expect( Array.isArray( interactionsArray ) ).toBe( true );
		expect( interactionsArray.length ).toBeGreaterThan( 0 );
		expect( interactionsArray[ 0 ] ).toMatch( /load.*fade/i );
	} );

	test( 'Add interaction via API call', async () => {
		const headingId = await editor.addWidget( { widgetType: 'e-heading' } );

		await editor.page.waitForTimeout( 1000 );

		await editor.page.evaluate( async ( { targetId, interactions } ) => {
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

			await $e.run( 'document/elements/settings', {
				container,
				settings: {
					interactions,
				},
			} );

			container.model.set( 'interactions', interactions );
			window.dispatchEvent( new CustomEvent( 'elementor/element/update_interactions' ) );

			await $e.run( 'document/save/draft', {} );
		}, { targetId: headingId, interactions: {
			version: 1,
			items: [ {
				animation: {
					animation_type: 'entrance',
					animation_id: 'load-fade-in--300-300',
				},
			} ],
		} } );

		await editor.page.waitForTimeout( 2000 );

		const interactionsSaved = await editor.page.evaluate( ( targetId ) => {
			const windowTyped = window as unknown as WindowType;
			const elementor = windowTyped.elementor;

			if ( ! elementor || ! elementor.documents ) {
				throw new Error( 'Elementor documents not found' );
			}

			const doc = elementor.documents.getCurrent();

			const findElementInDocument = ( elements: ElementorElement[], id: string ): ElementorElement | null => {
				for ( const el of elements ) {
					if ( el.id === id ) {
						return el;
					}
					if ( el.elements && el.elements.length > 0 ) {
						const found = findElementInDocument( el.elements, id );
						if ( found ) {
							return found;
						}
					}
				}
				return null;
			};

			const docElement = findElementInDocument( doc.config.elements, targetId );
			return !! ( docElement?.interactions && Object.keys( docElement.interactions ).length > 0 ) || !! docElement?.settings?.interactions;
		}, headingId );

		if ( ! interactionsSaved ) {
			throw new Error( 'Interactions were not saved to the document element' );
		}

		await editor.publishAndViewPage();

		const headingElement = editor.page.locator( '.e-heading-base' ).first();
		await expect( headingElement ).toBeVisible();
		await expect( headingElement ).toHaveAttribute( 'data-interactions' );

		const interactionsData = await headingElement.getAttribute( 'data-interactions' );
		expect( interactionsData ).toBeTruthy();

		const interactionsArray = JSON.parse( interactionsData );
		expect( Array.isArray( interactionsArray ) ).toBe( true );
		expect( interactionsArray.length ).toBeGreaterThan( 0 );
		expect( interactionsArray[ 0 ] ).toMatch( /load.*fade/i );
	} );
} );
