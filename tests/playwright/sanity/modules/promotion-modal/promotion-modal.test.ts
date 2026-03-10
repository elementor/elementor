import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../parallelTest';
const EDITOR_URL =
	process.env.PROMOTION_MODAL_EDITOR_URL ||
	'http://elementor-design-system-generator.local/wp-admin/post.php?post=10&action=elementor';
const EDITOR_LOAD_WAIT_MS = 10_000;

test.describe( 'Promotion Modal', () => {
	test( 'verify promotion modal and capture console errors', async ( { page }, testInfo ) => {
		const baseUrl = new URL( EDITOR_URL ).origin;
		await page.goto( `${ baseUrl }/wp-admin/` );

		const consoleMessages: Array<{ type: string; text: string }> = [];
		page.on( 'console', ( msg ) => {
			const type = msg.type();
			const text = msg.text();
			consoleMessages.push( { type, text } );
		} );

		await page.goto( EDITOR_URL );
		await page.waitForTimeout( EDITOR_LOAD_WAIT_MS );

		const errors = consoleMessages.filter( ( m ) => 'error' === m.type );
		const warnings = consoleMessages.filter( ( m ) => 'warning' === m.type );
		const promotionRelated = consoleMessages.filter(
			( m ) =>
				m.text.toLowerCase().includes( 'promotion-modal' ) ||
				m.text.toLowerCase().includes( 'infotip' ) ||
				m.text.toLowerCase().includes( 'usepromotionmodal' ) ||
				m.text.toLowerCase().includes( 'invalid prop' ) ||
				m.text.toLowerCase().includes( 'key' ),
		);

		await testInfo.attach( 'console-errors', {
			body: JSON.stringify( errors, null, 2 ),
			contentType: 'application/json',
		} );

		await testInfo.attach( 'console-warnings', {
			body: JSON.stringify( warnings, null, 2 ),
			contentType: 'application/json',
		} );

		await testInfo.attach( 'promotion-related-messages', {
			body: JSON.stringify( promotionRelated, null, 2 ),
			contentType: 'application/json',
		} );

		await page.screenshot( {
			path: testInfo.outputPath( 'editor-initial-state.png' ),
			fullPage: false,
		} );

		const moreButton = page.getByRole( 'button', { name: 'More' } );
		const moreButtonVisible = await moreButton.isVisible().catch( () => false );

		if ( moreButtonVisible ) {
			await moreButton.click();
			await page.waitForTimeout( 500 );

			const testPromotionItem = page.getByRole( 'menuitem', { name: 'Test Promotion Modal' } );
			const testItemVisible = await testPromotionItem.isVisible().catch( () => false );

			if ( testItemVisible ) {
				await testPromotionItem.click();
				await page.waitForTimeout( 500 );

				await page.screenshot( {
					path: testInfo.outputPath( 'after-click-test-promotion.png' ),
					fullPage: false,
				} );

				const infotipContent = page.locator( '[role="tooltip"], [data-infotip], .MuiPopover-root' );
				const infotipVisible = await infotipContent.first().isVisible().catch( () => false );

				await testInfo.attach( 'report', {
					body: `
Promotion Modal Test Report
==========================

Console Errors: ${ errors.length }
${ errors.map( ( e ) => `- ${ e.text }` ).join( '\n' ) }

Console Warnings: ${ warnings.length }
${ warnings.map( ( w ) => `- ${ w.text }` ).join( '\n' ) }

Promotion-related messages: ${ promotionRelated.length }
${ promotionRelated.map( ( m ) => `- [${ m.type }] ${ m.text }` ).join( '\n' ) }

UI Observations:
- More button visible: ${ moreButtonVisible }
- Test Promotion Modal menu item visible: ${ testItemVisible }
- Infotip/promotion modal visible after click: ${ infotipVisible }
`,
					contentType: 'text/plain',
				} );

				expect.soft(
					infotipVisible,
					'Infotip should be visible after clicking Test Promotion Modal',
				).toBe( true );
			} else {
				await testInfo.attach( 'report', {
					body: `Test Promotion Modal menu item not found. Available menu items may have different structure.`,
					contentType: 'text/plain',
				} );
			}
		} else {
			await testInfo.attach( 'report', {
				body: `More button not visible. Editor may not have fully loaded or tools menu structure differs.`,
				contentType: 'text/plain',
			} );
		}
	} );
} );
