import _path from 'path';
import { readFileSync } from 'fs';
import { parallelTest as test } from '../../../parallelTest';
import WpAdminPage from '../../../pages/wp-admin-page';
import { expect } from '@playwright/test';

const animationContent = JSON.parse(
	readFileSync( _path.resolve( __dirname, './templates/animation-deduplication.json' ), 'utf-8' ),
);

async function createPageWithAnimationContent( page: any ): Promise<string> {
	await page.goto( '/wp-admin' );
	await page.waitForLoadState( 'load' );

	const nonce: string = await page.evaluate( () => ( window as any ).wpApiSettings?.nonce ?? '' );
	const baseUrl = new URL( page.url() ).origin;

	const response = await page.context().request.post( `${ baseUrl }/index.php`, {
		params: { rest_route: '/wp/v2/pages' },
		headers: {
			'X-WP-Nonce': nonce,
			'Content-Type': 'application/json',
		},
		data: {
			title: 'Animation CSS Deduplication Test',
			status: 'publish',
			meta: {
				_elementor_data: JSON.stringify( animationContent ),
				_elementor_edit_mode: 'builder',
			},
		},
	} );

	if ( ! response.ok() ) {
		throw new Error( `Failed to create test page: ${ response.status() } ${ await response.text() }` );
	}

	const { id } = await response.json();

	return String( id );
}

test.describe( 'Animation CSS deduplication', () => {
	test( 'No duplicate stylesheet when applying existing animation; new animation gets its own stylesheet', async ( { page, apiRequests }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );

		const postId = await createPageWithAnimationContent( page );
		const editor = await wpAdmin.editExistingPostWithElementor( postId, { page, testInfo } );

		await test.step( 'Apply fadeInLeft to a new heading — no additional link tag should appear', async () => {
			const container = await editor.addElement( { elType: 'container' }, 'document' );
			await editor.addWidget( { widgetType: 'heading', container } );

			await editor.openPanelTab( 'advanced' );
			await editor.openSection( '_section_motion_effects' );
			await editor.setSelectControlValue( '_animation', 'fadeInLeft' );

			const count = await editor.getPreviewFrame().locator( 'link#e-animation-fadeInLeft-css' ).count();

			expect( count ).toBe( 1 );
		} );

		await test.step( 'Apply fadeInRight to a new heading — a new link tag should be added', async () => {
			const container = await editor.addElement( { elType: 'container' }, 'document' );
			await editor.addWidget( { widgetType: 'heading', container } );

			await editor.openPanelTab( 'advanced' );
			await editor.openSection( '_section_motion_effects' );
			await editor.setSelectControlValue( '_animation', 'fadeInRight' );

			const count = await editor.getPreviewFrame().locator( 'link#e-animation-fadeInRight-css' ).count();

			expect( count ).toBe( 1 );
		} );

		await test.step( 'Publish page', async () => {
			await editor.publishAndViewPage();
		} );

		await test.step( 'Frontend — animation stylesheets are present exactly once', async () => {
			await expect( page.locator( 'link#e-animation-fadeInLeft-css' ) ).toHaveCount( 1 );
			await expect( page.locator( 'link#e-animation-fadeInRight-css' ) ).toHaveCount( 1 );
		} );

		await test.step( 'Frontend — animation CSS rules are correct', async () => {
			const getAnimationName = ( selector: string ) =>
				page.evaluate( ( selectorString: string ) => {
					for ( const sheet of Array.from( document.styleSheets ) ) {
						try {
							for ( const rule of Array.from( sheet.cssRules ) ) {
								if ( rule instanceof CSSStyleRule && rule.selectorText === selectorString ) {
									return rule.style.animationName;
								}
							}
						} catch {
							// skip cross-origin sheets
						}
					}

					return null;
				}, selector );

			expect( await getAnimationName( '.fadeInLeft' ) ).toBe( 'fadeInLeft' );
			expect( await getAnimationName( '.fadeInRight' ) ).toBe( 'fadeInRight' );
		} );
	} );
} );
