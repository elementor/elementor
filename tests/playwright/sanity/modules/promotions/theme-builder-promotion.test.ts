import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../parallelTest';
import { timeouts } from '../../../config/timeouts';
import WpAdminPage from '../../../pages/wp-admin-page';
import {
	cleanupHeaderFooterPromotionTestData,
	enableThemeBuilderPromotion,
	resetEditorCounter,
	seedHeaderFooterPromotionPages,
} from './theme-builder-promotion.helper';

const HEADER_FOOTER_MODAL_TITLE = 'Tie your whole website together';
const EDITOR_COUNTER_TO_SKIP_CHECKLIST = 10;

test.describe( 'Theme builder promotion @promotions', () => {
	test( 'Header-footer promotion shows once after publish and stays dismissed after closing', async ( { page, apiRequests }, testInfo ) => {
		const request = page.context().request;

		await enableThemeBuilderPromotion( apiRequests, request );
		await seedHeaderFooterPromotionPages( apiRequests, request );
		await resetEditorCounter( apiRequests, request, EDITOR_COUNTER_TO_SKIP_CHECKLIST );

		try {
			const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
			const editor = await wpAdmin.openNewPage();
			const modal = page.getByRole( 'dialog' ).filter( { hasText: HEADER_FOOTER_MODAL_TITLE } );

			await editor.addWidget( { widgetType: 'heading' } );

			await test.step( 'Publish page and show header-footer promotion modal', async () => {
				await editor.publishPage();
				await expect( modal ).toBeVisible( { timeout: timeouts.heavyAction } );
				await expect( modal.getByRole( 'button', { name: 'Open Theme Builder' } ) ).toBeVisible();
			} );

			await test.step( 'Close promotion modal', async () => {
				await modal.getByRole( 'button', { name: 'close' } ).click();
				await expect( modal ).toBeHidden( { timeout: timeouts.expect } );
			} );

			await test.step( 'Publish again after editing and keep promotion dismissed', async () => {
				await editor.addWidget( { widgetType: 'text-editor' } );
				await editor.publishPage();
				await expect( modal ).toBeHidden( { timeout: timeouts.expect } );
			} );
		} finally {
			await cleanupHeaderFooterPromotionTestData( apiRequests, request );
		}
	} );
} );
