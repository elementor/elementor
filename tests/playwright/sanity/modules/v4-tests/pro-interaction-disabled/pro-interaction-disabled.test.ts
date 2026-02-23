import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../../parallelTest';
import WpAdminPage from '../../../../pages/wp-admin-page';
import _path from 'path';

test.describe( 'Pro Interaction Disabled Content @v4-tests', () => {
	const TEMPLATE_PATH = _path.resolve(
		__dirname,
		'./pro-interaction-template.json',
	);

	let editorUser: { id: string; username: string; password: string };

	test.beforeAll( async ( { browser, apiRequests }, testInfo ) => {
		const context = await browser.newContext();
		const page = await context.newPage();
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );

		await wpAdmin.setExperiments( {
			e_interactions: 'active',
			e_atomic_elements: 'active',
		} );

		editorUser = await apiRequests.createNewUser( page.context().request, {
			username: 'proInteractionEditor',
			password: 'password',
			email: 'pro-interaction-editor@test.com',
			roles: [ 'editor' ],
		} );

		await context.close();
	} );

	test.afterAll( async ( { browser, apiRequests }, testInfo ) => {
		const context = await browser.newContext();
		const page = await context.newPage();
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		await wpAdmin.resetExperiments();

		if ( editorUser?.id ) {
			try {
				await apiRequests.deleteUser( page.context().request, editorUser.id );
			} catch {
				// Cleanup should not fail the suite
			}
		}

		await context.close();
	} );

	test( 'Admin sees "Upgrade now" CTA when clicking a disabled Pro interaction', async ( {
		page,
		apiRequests,
	}, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = await wpAdmin.openNewPage();

		await test.step( 'Load template with Pro interaction', async () => {
			await editor.loadTemplate( TEMPLATE_PATH );
		} );

		await test.step( 'Select widget and open interactions tab', async () => {
			const previewFrame = editor.getPreviewFrame();
			const widget = previewFrame.locator( '[data-widget_type="e-heading.default"]' ).first();
			await widget.click();

			const interactionsTab = page.getByRole( 'tab', { name: 'Interactions' } );
			await expect( interactionsTab ).toBeVisible();
			await interactionsTab.click();
			await expect( interactionsTab ).toHaveAttribute( 'aria-selected', 'true' );
		} );

		await test.step( 'Click disabled Pro interaction tag to trigger promo popover', async () => {
			const interactionTag = page.locator( '.MuiTag-root' ).first();
			await expect( interactionTag ).toBeVisible();
			await interactionTag.click();
		} );

		await test.step( 'Assert promotion popover shows "Upgrade now" for admin', async () => {
			const promoDialog = page.locator( '[role="dialog"][aria-label="promotion-popover-title"]' );
			await expect( promoDialog ).toBeVisible();

			await expect( promoDialog.getByText( 'Upgrade now' ) ).toBeVisible();
			await expect(
				promoDialog.getByText(
					'This interaction is currently inactive and not showing on your website. Activate your Pro plugin to use it again.',
				),
			).toBeVisible();
		} );
	} );

	test( 'Non-admin (editor) does NOT see "Upgrade now" CTA in promo popover', async ( {
		browser,
		apiRequests,
	}, testInfo ) => {
		await test.step( 'Login as editor user and open editor', async () => {
			const context = await browser.newContext( { storageState: undefined } );
			const page = await context.newPage();
			const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );

			await wpAdmin.customLogin( editorUser.username, editorUser.password );
			const editor = await wpAdmin.openNewPage( false, false );

			await test.step( 'Load template with Pro interaction', async () => {
				await editor.loadTemplate( TEMPLATE_PATH );
			} );

			await test.step( 'Select widget and open interactions tab', async () => {
				const previewFrame = editor.getPreviewFrame();
				const widget = previewFrame
					.locator( '[data-widget_type="e-heading.default"]' )
					.first();
				await widget.click();

				const interactionsTab = page.getByRole( 'tab', { name: 'Interactions' } );
				await expect( interactionsTab ).toBeVisible();
				await interactionsTab.click();
				await expect( interactionsTab ).toHaveAttribute( 'aria-selected', 'true' );
			} );

			await test.step( 'Click disabled Pro interaction tag', async () => {
				const interactionTag = page.locator( '.MuiTag-root' ).first();
				await expect( interactionTag ).toBeVisible();
				await interactionTag.click();
			} );

			await test.step( 'Assert popover is visible but WITHOUT "Upgrade now"', async () => {
				const promoDialog = page.locator(
					'[role="dialog"][aria-label="promotion-popover-title"]',
				);
				await expect( promoDialog ).toBeVisible();

				await expect(
					promoDialog.getByText(
						'This interaction is currently inactive and not showing on your website. Activate your Pro plugin to use it again.',
					),
				).toBeVisible();

				await expect( promoDialog.getByText( 'Upgrade now' ) ).not.toBeVisible();
			} );

			await context.close();
		} );
	} );
} );
