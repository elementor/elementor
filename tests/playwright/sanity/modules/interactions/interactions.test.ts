import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../parallelTest';
import WpAdminPage from '../../../pages/wp-admin-page';
import EditorPage from '../../../pages/editor-page';

test.describe( 'Interactions Module @interactions', () => {
	let editor: EditorPage;

	test.beforeEach( async ( { browser, apiRequests }, testInfo ) => {
		const page = await browser.newPage();
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );

		await wpAdmin.setExperiments( {
			e_opt_in_v4_page: 'active',
			e_atomic_elements: 'active',
			e_interactions: 'active',
		} );

		editor = await wpAdmin.openNewPage();
	} );

	test.afterEach( async ( { browser, apiRequests }, testInfo ) => {
		const page = await browser.newPage();
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		await wpAdmin.resetExperiments();
		await page.close();
	} );

	test( 'Add interaction via UI controls', async ( { page } ) => {
		await editor.addElement( { elType: 'e-heading' }, 'document' );

		await page.getByRole( 'tab', { name: 'Interactions' } ).click();
		await page.getByRole( 'button', { name: 'Create an interaction' } ).click();
		await page.waitForSelector( '.MuiPopover-root' );

		await page.getByText( 'Page load', { exact: true } ).click();
		await page.getByRole( 'option', { name: 'Page load' } ).click();
		await page.getByText( 'Fade', { exact: true } ).click();
		await page.getByRole( 'option', { name: 'Fade' } ).click();
		await page.locator( 'body' ).click();

		await expect( page.locator( '.MuiTag-root' ).first() ).toBeVisible();

		await editor.publishAndViewPage();

		const headingElement = page.locator( '.e-heading-base' ).first();
		await expect( headingElement ).toBeVisible();
		await expect( headingElement ).toHaveAttribute( 'data-interactions' );

		const interactionsData = await headingElement.getAttribute( 'data-interactions' );
		expect( interactionsData ).toBeTruthy();

		const interactionsArray = JSON.parse( interactionsData );
		expect( Array.isArray( interactionsArray ) ).toBe( true );
		expect( interactionsArray.length ).toBeGreaterThan( 0 );
		expect( interactionsArray[ 0 ] ).toMatch( /load.*fade/i );
	} );

	test( 'Add interaction via API call', async ( { page, request } ) => {
		const headingId = await editor.addElement( { elType: 'e-heading' }, 'document' );

		const doc = await page.evaluate( () => {
			return ( window as any ).elementor.documents.getCurrent().config;
		} );

		const nonce = await page.evaluate( () => {
			return ( window as any ).elementor.config.ajax.nonce;
		} );

		const findElement = ( elements, targetId ) => {
			for ( const el of elements ) {
				if ( el.id === targetId ) {
					return el;
				}
				if ( el.elements ) {
					const found = findElement( el.elements, targetId );
					if ( found ) return found;
				}
			}
			return null;
		};

		const element = findElement( doc.elements, headingId );
		element.interactions = {
			version: 1,
			items: [ {
				animation: {
					animation_type: 'entrance',
					animation_id: 'fadeIn',
				},
			} ],
		};

		const response = await request.post( '/wp-admin/admin-ajax.php', {
			data: {
				action: 'elementor_ajax',
				actions: JSON.stringify( {
					save_builder: {
						data: {
							status: 'draft',
							elements: JSON.stringify( doc.elements ),
							settings: JSON.stringify( doc.settings || {} ),
						},
					},
				} ),
				editor_post_id: doc.id,
				_nonce: nonce,
			},
		} );

		expect( response.ok() ).toBeTruthy();

		await editor.publishAndViewPage();

		const headingElement = page.locator( '.e-heading-base' ).first();
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
