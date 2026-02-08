import { parallelTest as test } from '../../../parallelTest';
import WpAdminPage from '../../../pages/wp-admin-page';
import { expect } from '@playwright/test';

function getElementInteractionsData( elementId: string ) {
	const scriptTag = document.querySelector( 'script[data-e-interactions="true"]' );
	if ( ! scriptTag ) {
		return null;
	}

	try {
		const allInteractions = JSON.parse( scriptTag.textContent || '[]' );
		const elementData = allInteractions.find(
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			( item: any ) => item.elementId === elementId || item.dataId === elementId,
		);

		if ( ! elementData || ! elementData.interactions ) {
			return null;
		}

		return elementData.interactions;
	} catch {
		return null;
	}
}

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
			await editor.v4Panel.fillField( 0, '300' );

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
			expect( eventDetail ).toHaveProperty( 'interactionId' );
			expect( eventDetail ).toHaveProperty( 'elementId' );
		} );

		await test.step( 'Publish and view the page', async () => {
			await editor.publishAndViewPage();
		} );

		await test.step( 'Verify animation runs on published page', async () => {
			const headingElement = page.locator( '.e-heading-base' ).first();

			await expect( headingElement ).toBeVisible();

			// Verify motion.dev library is loaded
			const isMotionLoaded = await page.evaluate( () => {
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				return typeof ( window as any ).Motion !== 'undefined' || typeof ( window as any ).animate !== 'undefined';
			} );
			expect( isMotionLoaded ).toBe( true );

			// Wait for the animation to complete (default 300ms duration + buffer)
			await page.waitForTimeout( 1000 );

			// For "Fade In" on "Page load", the element should be fully visible (opacity: 1)
			const opacity = await headingElement.evaluate( ( el ) => window.getComputedStyle( el ).opacity );
			expect( parseFloat( opacity ) ).toBeGreaterThan( 0.8 );
		} );
	} );

	// Skipped until promotion control is added ED-21615
	test.skip( 'Replay control is visible and disabled in interactions popover', async ( { page, apiRequests }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = await wpAdmin.openNewPage();

		await test.step( 'Add heading widget and navigate to interactions tab', async () => {
			const container = await editor.addElement( { elType: 'e-div-block' }, 'document' );
			await editor.addWidget( { widgetType: 'e-heading', container } );

			const interactionsTab = page.getByRole( 'tab', { name: 'Interactions' } );
			await interactionsTab.click();
			await expect( interactionsTab ).toHaveAttribute( 'aria-selected', 'true' );
		} );

		await test.step( 'Create interaction and open popover', async () => {
			const addInteractionButton = page.getByRole( 'button', { name: 'Create an interaction' } );
			await addInteractionButton.click();

			await page.waitForSelector( '.MuiPopover-root' );

			await expect( page.locator( '.MuiPopover-root' ) ).toBeVisible();
		} );

		await test.step( 'Replay control is not visible on page load trigger', async () => {
			const replayLabel = page.getByText( 'Replay', { exact: true } );

			// Assert - label is not visible
			await expect( replayLabel ).not.toBeVisible();
		} );

		await test.step( 'Verify Replay control is visible and disabled', async () => {
			// Arrange
			const selectOption = async ( openSelector, optionName ) => {
				await openSelector.click();

				const option = page.getByRole( 'option', { name: optionName } );
				await option.click();
			};

			await selectOption( page.getByText( 'Page load', { exact: true } ), 'Scroll into view' );

			const replayLabel = page.getByText( 'Replay', { exact: true } );

			// Assert - label is visible
			await expect( replayLabel ).toBeVisible();

			// Assert - toggle buttons exist
			const yesButton = page.getByLabel( 'Yes', { exact: true } );
			const noButton = page.getByLabel( 'No', { exact: true } );

			await expect( yesButton ).toBeVisible();
			await expect( noButton ).toBeVisible();

			// Assert - buttons are disabled
			await expect( yesButton ).toBeDisabled();
			await expect( noButton ).toBeDisabled();
		} );
	} );

	test( 'Duplicate element with interactions generates new temp IDs', async ( { page, apiRequests }, testInfo ) => {
		let originalElementId = '';
		let duplicatedElementId = '';
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = await wpAdmin.openNewPage();

		await test.step( 'Add widget and create interaction', async () => {
			const container = await editor.addElement( { elType: 'e-div-block' }, 'document' );
			originalElementId = await editor.addWidget( { widgetType: 'e-heading', container } );

			const interactionsTab = page.getByRole( 'tab', { name: 'Interactions' } );
			await interactionsTab.click();

			const addInteractionButton = page.getByRole( 'button', { name: 'Create an interaction' } );
			await addInteractionButton.click();
			await page.waitForSelector( '.MuiPopover-root' );
			await page.locator( 'body' ).click();
		} );

		await test.step( 'Save to get permanent IDs', async () => {
			await editor.publishPage();
			await page.reload();
			await editor.waitForPanelToLoad();
		} );

		await test.step( 'Get original interaction ID from saved data', async () => {
			const previewFrame = editor.getPreviewFrame();

			const originalInteractionsData = await previewFrame.evaluate( getElementInteractionsData, originalElementId );

			expect( originalInteractionsData ).toBeTruthy();
			expect( originalInteractionsData.items[ 0 ]?.value?.interaction_id?.value ).toBeTruthy();
			const originalInteractionId = originalInteractionsData.items[ 0 ].value.interaction_id.value;
			expect( originalInteractionId ).not.toContain( 'temp-' );
		} );

		await test.step( 'Duplicate the element', async () => {
			const elementInPreview = editor.getPreviewFrame().locator( `[data-id="${ originalElementId }"]` );
			await elementInPreview.click( { button: 'right' } );

			await page.getByRole( 'menuitem', { name: 'Duplicate' } ).click();
			await page.waitForTimeout( 500 );

			const originalElement = editor.getPreviewFrame().locator( `[data-id="${ originalElementId }"]` );
			const duplicatedElement = originalElement.locator( 'xpath=./following-sibling::*[1]' );
			duplicatedElementId = await duplicatedElement.getAttribute( 'data-id' );

			expect( duplicatedElementId ).toBeTruthy();
			expect( duplicatedElementId ).not.toBe( originalElementId );
		} );

		await test.step( 'Verify duplicated element has interactions with cleaned IDs', async () => {
			await editor.selectElement( duplicatedElementId );
			await page.waitForTimeout( 500 );

			const interactionsTab = page.getByRole( 'tab', { name: 'Interactions' } );
			await interactionsTab.click();
			await page.waitForTimeout( 500 );

			const previewFrame = editor.getPreviewFrame();

			await previewFrame.waitForFunction(
				( elementId ) => {
					const scriptTag = document.querySelector( 'script[data-e-interactions="true"]' );
					if ( ! scriptTag ) {
						return false;
					}
					try {
						const allInteractions = JSON.parse( scriptTag.textContent || '[]' );
						const elementData = allInteractions.find(
							// eslint-disable-next-line @typescript-eslint/no-explicit-any
							( item: any ) => ( item.elementId === elementId || item.dataId === elementId ) && item.interactions?.items?.length > 0,
						);
						return !! ( elementData );
					} catch {
						return false;
					}
				},
				duplicatedElementId,
				{ timeout: 5000 },
			);

			const duplicatedInteractionsData = await previewFrame.evaluate( getElementInteractionsData, duplicatedElementId );

			expect( duplicatedInteractionsData ).toBeTruthy();
			expect( duplicatedInteractionsData.items ).toHaveLength( 1 );

			const duplicatedInteractionId = duplicatedInteractionsData.items[ 0 ].value.interaction_id?.value;

			// Should have an interaction ID (either temp or permanent)
			expect( duplicatedInteractionId ).toBeTruthy();

			const originalInteractionsData = await previewFrame.evaluate( getElementInteractionsData, originalElementId );
			const originalInteractionId = originalInteractionsData.items[ 0 ].value.interaction_id.value;
			expect( duplicatedInteractionId ).not.toBe( originalInteractionId );
		} );
	} );

	test( 'Multiple interactions on same element have unique IDs', async ( { page, apiRequests }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = await wpAdmin.openNewPage();
		let originalElementId: string;

		await test.step( 'Add widget and create multiple interactions', async () => {
			const container = await editor.addElement( { elType: 'e-div-block' }, 'document' );
			originalElementId = await editor.addWidget( { widgetType: 'e-heading', container } );

			const interactionsTab = page.getByRole( 'tab', { name: 'Interactions' } );
			await interactionsTab.click();

			// Create first interaction
			const addInteractionButton = page.getByRole( 'button', { name: 'Create an interaction' } );
			await addInteractionButton.click();
			await page.waitForSelector( '.MuiPopover-root' );
			await page.locator( 'body' ).click();

			// Create second interaction
			const addAdditionalInteractionButton = page.locator( 'button[aria-label*="Add item"]' );
			await addAdditionalInteractionButton.click();
			await page.waitForSelector( '.MuiPopover-root' );
			await page.locator( 'body' ).click();
		} );

		await test.step( 'Verify each interaction has unique ID', async () => {
			const interactionTags = page.locator( '.MuiTag-root' );
			await expect( interactionTags ).toHaveCount( 2 );
			const previewFrame = editor.getPreviewFrame();

			const interactionsData = await previewFrame.evaluate( getElementInteractionsData, originalElementId );

			expect( interactionsData.items ).toHaveLength( 2 );

			const id1 = interactionsData.items[ 0 ].value.interaction_id?.value;
			const id2 = interactionsData.items[ 1 ].value.interaction_id?.value;

			expect( id1 ).not.toBe( id2 );
			expect( id1 ).toContain( 'temp-' );
			expect( id2 ).toContain( 'temp-' );
		} );

		await test.step( 'Verify play buttons trigger correct interaction IDs', async () => {
			const interactionTags = page.locator( '.MuiTag-root' );

			// Set up event listeners
			await page.evaluate( () => {
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				( window.top as any ).addEventListener( 'atomic/play_interactions', ( e: CustomEvent ) => {
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					( window as any ).__interactionEvents = ( window as any ).__interactionEvents || [];
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					( window as any ).__interactionEvents.push( e.detail );
				} );
			} );

			// Click first play button
			const firstTag = interactionTags.first();
			await firstTag.hover();
			await firstTag.locator( 'button[aria-label*="Play interaction"]' ).click();
			await page.waitForTimeout( 100 );

			// Click second play button
			const secondTag = interactionTags.nth( 1 );
			await secondTag.hover();
			await secondTag.locator( 'button[aria-label*="Play interaction"]' ).click();
			await page.waitForTimeout( 100 );

			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const capturedEvents = await page.evaluate( () => ( window as any ).__interactionEvents || [] );

			expect( capturedEvents ).toHaveLength( 2 );
			expect( capturedEvents[ 0 ].interactionId ).toBeTruthy();
			expect( capturedEvents[ 1 ].interactionId ).toBeTruthy();
			expect( capturedEvents[ 0 ].interactionId ).not.toBe( capturedEvents[ 1 ].interactionId );
		} );
	} );
} );

