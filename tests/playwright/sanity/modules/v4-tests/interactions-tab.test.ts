import { parallelTest as test } from '../../../parallelTest';
import WpAdminPage from '../../../pages/wp-admin-page';
import { expect } from '@playwright/test';

const SKIP_ADD_INTERACTION_BY_PLUS_BUTTON = true;

test.describe( 'Interactions Tab @v4-tests', () => {
	test.beforeAll( async ( { browser, apiRequests }, testInfo ) => {
		const context = await browser.newContext();
		const page = await context.newPage();
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		await wpAdmin.setExperiments( {
			e_interactions: 'active',
			e_atomic_elements: 'active',
		} );
		await page.close();
	} );

	test.afterAll( async ( { browser, apiRequests }, testInfo ) => {
		const context = await browser.newContext();
		const page = await context.newPage();
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		await wpAdmin.resetExperiments();
		await page.close();
	} );

	test( 'Interactions tab is visible when experiment is active', async ( { page, apiRequests }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = await wpAdmin.openNewPage();

		await test.step( 'Add atomic widget to enable panel tabs', async () => {
			const container = await editor.addElement( { elType: 'container' }, 'document' );
			await editor.addWidget( { widgetType: 'e-heading', container } );
		} );

		await test.step( 'Verify interactions tab is present', async () => {
			const interactionsTab = page.getByRole( 'tab', { name: 'Interactions' } );
			await expect( interactionsTab ).toBeVisible();
		} );
	} );

	test( 'Interactions tab displays empty state correctly', async ( { page, apiRequests }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = await wpAdmin.openNewPage();
		const panelSelector = '#elementor-panel-inner';

		await test.step( 'Setup widget and navigate to interactions tab', async () => {
			const container = await editor.addElement( { elType: 'container' }, 'document' );
			await editor.addWidget( { widgetType: 'e-heading', container } );
		} );

		await test.step( 'Open interactions tab and capture screenshot', async () => {
			const interactionsTab = page.getByRole( 'tab', { name: 'Interactions' } );
			await interactionsTab.click();

			await expect.soft( page.locator( panelSelector ) ).toHaveScreenshot( 'interactions-empty-state.png' );
		} );
	} );

	test( 'Interactions functionality end-to-end test', async ( { page, apiRequests }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = await wpAdmin.openNewPage();

		await test.step( 'Add heading widget to enable interactions', async () => {
			const container = await editor.addElement( { elType: 'container' }, 'document' );
			await editor.addWidget( { widgetType: 'e-heading', container } );
		} );

		await test.step( 'Navigate to interactions tab', async () => {
			const interactionsTab = page.getByRole( 'tab', { name: 'Interactions' } );
			await interactionsTab.click();
			await expect( interactionsTab ).toHaveAttribute( 'aria-selected', 'true' );
		} );

		await test.step( 'Start adding interactions button', async () => {
			const addInteractionButton = page.getByRole( 'button', { name: 'Create an interaction' } );
			await expect( addInteractionButton ).toBeVisible();
			await addInteractionButton.click();
		} );

		await test.step( 'Add interaction using plus button', async () => {
			if ( SKIP_ADD_INTERACTION_BY_PLUS_BUTTON ) {
				return;
			}

			const addInteractionButton = page.locator( '[aria-label="Add interaction"]' );
			await expect( addInteractionButton ).toBeVisible();
			await addInteractionButton.click();
		} );

		await test.step( 'Select animation options from popover controls', async () => {
			const interactionTag = page.locator( '.MuiTag-root' ).first();

			await expect( interactionTag ).toBeVisible();
			await page.waitForSelector( '.MuiPopover-root' );

			const directionOption = page.getByRole( 'button', { name: 'Up' } );

			await expect( directionOption ).toBeVisible();
			await directionOption.click();
			await expect( interactionTag ).toContainText( 'Page Load - Fade In Top (300ms)' );

			await page.locator( 'body' ).click();
		} );

		await test.step( 'Publish and view the page', async () => {
			await editor.publishAndViewPage();
		} );

		await test.step( 'Verify data-interactions attribute on heading', async () => {
			const headingElement = page.locator( '.e-heading-base' ).first();

			await expect( headingElement ).toBeVisible();
			await expect( headingElement ).toHaveAttribute( 'data-interactions' );

			const interactionsData = await headingElement.getAttribute( 'data-interactions' );
			expect( interactionsData ).toBeTruthy();
		} );
	} );
} );
