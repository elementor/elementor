import { parallelTest as test } from '../../../parallelTest';
import { expect } from '@playwright/test';
import { DriverFactory } from '../../../drivers/driver-factory';
import WpAdminPage from '../../../pages/wp-admin-page';

test.describe( 'Interactions Tab @v4-tests', () => {
	test.beforeAll( async () => {
		await DriverFactory.activateExperimentsCli( [ 'e_atomic_elements', 'e_interactions' ] );
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

		await test.step( 'Select animation options from popover controls', async () => {
			const interactionTag = page.locator( '.MuiTag-root' ).first();

			await expect( interactionTag ).toBeVisible();
			await page.waitForSelector( '.MuiPopover-root' );

			const selectOption = async ( openSelector, optionName ) => {
				await expect( openSelector ).toBeVisible();
				await openSelector.click();

				const option = page.getByRole( 'option', { name: optionName } );
				await expect( option ).toBeVisible();
				await option.click();
			};

			await selectOption( page.getByText( 'Page load', { exact: true } ), 'Scroll into view' );
			await selectOption( page.getByText( 'Fade', { exact: true } ), 'Slide' );
			await selectOption( page.getByText( '300 MS', { exact: true } ), '100 MS' );

			const effectTypeOption = page.getByLabel( 'Out', { exact: true } );
			const directionOption = page.getByLabel( 'To bottom', { exact: true } );

			await expect( effectTypeOption ).toBeVisible();
			await effectTypeOption.click();

			await expect( directionOption ).toBeVisible();
			await directionOption.click();

			await expect( interactionTag ).toContainText( 'Scroll into view: Slide Out' );

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

	test( 'Verify animation plays correctly via play button, publish, and frontend view', async ( { page, apiRequests }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = await wpAdmin.openNewPage();

		await test.step( 'Add heading widget and navigate to interactions tab', async () => {
			const container = await editor.addElement( { elType: 'container' }, 'document' );
			await editor.addWidget( { widgetType: 'e-heading', container } );

			const interactionsTab = page.getByRole( 'tab', { name: 'Interactions' } );
			await interactionsTab.click();
			await expect( interactionsTab ).toHaveAttribute( 'aria-selected', 'true' );
		} );

		await test.step( 'Create a simple Fade In animation on Page load', async () => {
			const addInteractionButton = page.getByRole( 'button', { name: 'Create an interaction' } );
			await expect( addInteractionButton ).toBeVisible();
			await addInteractionButton.click();

			await page.waitForSelector( '.MuiPopover-root' );

			// Keep default "Page load" and "Fade" settings, just close the popover
			await page.locator( 'body' ).click();

			const interactionTag = page.locator( '.MuiTag-root' ).first();
			await expect( interactionTag ).toBeVisible();
		} );

		await test.step( 'Test play button in editor', async () => {
			// Set up event listener before clicking play button
			const eventPromise = page.evaluate( () => {
				return new Promise( ( resolve ) => {
					const handler = ( e: CustomEvent ) => {
						resolve( e.detail );
					};
					window.top.addEventListener( 'atomic/play_interactions', handler, { once: true } );
				} );
			} );

			// Click the play button
			const interactionTag = page.locator( '.MuiTag-root' ).first();
			const { x, y, width, height } = await interactionTag.boundingBox();
			await page.mouse.move( x + ( width / 2 ), y + ( height / 2 ) );
			await interactionTag.locator( 'button[aria-label*="Play interaction"]' ).click();

			// Verify the custom event was fired with correct data
			const eventDetail = await eventPromise;
			expect( eventDetail ).toHaveProperty( 'animationId' );
			expect( eventDetail ).toHaveProperty( 'elementId' );
		} );

		await test.step( 'Publish and view the page', async () => {
			await editor.publishAndViewPage();
		} );

		await test.step( 'Verify animation runs on published page', async () => {
			const headingElement = page.locator( '.e-heading-base' ).first();

			await expect( headingElement ).toBeVisible();
			await expect( headingElement ).toHaveAttribute( 'data-interactions' );

			// Verify motion.dev library is loaded
			const isMotionLoaded = await page.evaluate( () => {
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				return typeof ( window as any ).Motion !== 'undefined' || typeof ( window as any ).animate !== 'undefined';
			} );
			expect( isMotionLoaded ).toBe( true );

			// Wait for the animation to complete (default 300ms duration + buffer)
			await page.waitForTimeout( 500 );

			// For "Fade In" on "Page load", the element should be fully visible (opacity: 1)
			const opacity = await headingElement.evaluate( ( el ) => window.getComputedStyle( el ).opacity );
			expect( parseFloat( opacity ) ).toBeGreaterThan( 0.9 );
		} );
	} );

	test( 'Replay control is visible and disabled in interactions popover', async ( { page, apiRequests }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = await wpAdmin.openNewPage();
	
		await test.step( 'Add heading widget and navigate to interactions tab', async () => {
			const container = await editor.addElement( { elType: 'container' }, 'document' );
			await editor.addWidget( { widgetType: 'e-heading', container } );
	
			const interactionsTab = page.getByRole( 'tab', { name: 'Interactions' } );
			await interactionsTab.click();
			await expect( interactionsTab ).toHaveAttribute( 'aria-selected', 'true' );
		} );
	
		await test.step( 'Create interaction and open popover', async () => {
			const addInteractionButton = page.getByRole( 'button', { name: 'Create an interaction' } );
			await expect( addInteractionButton ).toBeVisible();
			await addInteractionButton.click();
	
			await page.waitForSelector( '.MuiPopover-root' );
		} );
	
		await test.step( 'Verify Replay control is visible and disabled', async () => {
			// Arrange
			const replayLabel = page.getByText( 'Replay', { exact: true } );
			const replayToggleGroup = page.locator( '.MuiPopover-root' ).getByRole( 'group' ).filter( { has: page.getByLabel( 'Yes' ) } );
	
			// Assert - label is visible
			await expect( replayLabel ).toBeVisible();
	
			// Assert - toggle buttons exist
			const yesButton = replayToggleGroup.getByLabel( 'Yes' );
			const noButton = replayToggleGroup.getByLabel( 'No' );
	
			await expect( yesButton ).toBeVisible();
			await expect( noButton ).toBeVisible();
	
			// Assert - buttons are disabled
			await expect( yesButton ).toBeDisabled();
			await expect( noButton ).toBeDisabled();
		} );
	} );
} );

