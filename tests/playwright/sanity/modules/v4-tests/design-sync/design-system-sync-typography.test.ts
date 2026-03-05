import type EditorPage from '../../../../pages/editor-page';
import { expect, type Page } from '@playwright/test';
import { parallelTest as test } from '../../../../parallelTest';
import WpAdminPage from '../../../../pages/wp-admin-page';
import { deleteAllGlobalClasses, openClassManager, saveAndCloseClassManagerViaDialog, startSyncToV3 } from '../global-classes/utils';

const CLASS_NAME = 'SyncTypoTest';
const BREAKPOINT_FONT_SIZES: Record<string, number> = {
	desktop: 74,
	tablet: 48,
};

test.describe( 'Design System Sync - Typography V4→V3 @v4-tests', () => {
	let wpAdmin: WpAdminPage;
	let editor: EditorPage;
	let page: Page;

	test.beforeAll( async ( { browser, apiRequests }, testInfo ) => {
		page = await browser.newPage();
		wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		await wpAdmin.setExperiments( {
			e_atomic_elements: 'active',
			e_classes: 'active',
			e_design_system_sync: 'active',
		} );

		const { request } = page.context();
		await deleteAllGlobalClasses( apiRequests, request );
	} );

	test.afterAll( async ( { apiRequests } ) => {
		const { request } = page.context();
		await deleteAllGlobalClasses( apiRequests, request );
		await wpAdmin.resetExperiments();
		await page.close();
	} );

	test( 'Synced V4 typography class appears in V3 widget with correct responsive font-size values', async () => {
		let containerId: string;
		let elementId: string;

		await test.step( 'Add V4 widget and create class with responsive typography', async () => {
			editor = await wpAdmin.openNewPage();
			containerId = await editor.addElement( { elType: 'container' }, 'document' );
			elementId = await editor.addWidget( { widgetType: 'e-heading', container: containerId } );
			await editor.v4Panel.openTab( 'style' );
			await editor.v4Panel.style.addGlobalClass( CLASS_NAME );

			await editor.v4Panel.style.openSection( 'Typography' );
			await editor.v4Panel.style.setFontSize( BREAKPOINT_FONT_SIZES.desktop, 'px' );

			await editor.changeResponsiveView( 'tablet' );
			await editor.v4Panel.style.setFontSize( BREAKPOINT_FONT_SIZES.tablet, 'px' );
			await editor.changeResponsiveView( 'desktop' );
		} );

		await test.step( 'Enable sync_to_v3 via Class Manager UI', async () => {
			await openClassManager( page, editor, elementId );

			await startSyncToV3( page, CLASS_NAME );

			await saveAndCloseClassManagerViaDialog( page );
		} );

		await test.step( 'Reload editor, add V3 heading widget, and apply synced global typography', async () => {
			editor = await wpAdmin.openNewPage();
			await editor.addWidget( { widgetType: 'heading' } );
			await editor.openPanelTab( 'style' );

			await page.locator( '.elementor-control-typography_typography .e-global__popover-toggle' ).click();

			const syncedItem = page.locator( '.e-global__preview-item.e-global__typography' ).filter( { hasText: CLASS_NAME } );
			await expect( syncedItem ).toBeVisible( { timeout: 10000 } );
			await syncedItem.click();
		} );

		await test.step( `Verify desktop font-size is ${ BREAKPOINT_FONT_SIZES.desktop }`, async () => {
			await page.locator( '.elementor-control-typography_typography .elementor-control-popover-toggle-toggle-label' ).click();

			const desktopFontSizeInput = page.locator( '.elementor-control-typography_font_size .elementor-slider-input input' );
			await expect( desktopFontSizeInput ).toHaveValue( String( BREAKPOINT_FONT_SIZES.desktop ) );
		} );

		await test.step( `Switch to tablet and verify font-size is ${ BREAKPOINT_FONT_SIZES.tablet }`, async () => {
			await editor.changeResponsiveView( 'tablet' );

			const tabletFontSizeInput = page.locator( '.elementor-control-typography_font_size_tablet .elementor-slider-input input' );
			await expect( tabletFontSizeInput ).toHaveValue( String( BREAKPOINT_FONT_SIZES.tablet ) );
		} );
	} );
} );
