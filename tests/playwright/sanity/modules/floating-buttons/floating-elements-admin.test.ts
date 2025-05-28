import { parallelTest as test } from '../../../parallelTest';
import FloatingElementPage from './floating-element-page';
import { expect } from '@playwright/test';
import EditorSelectors from '../../../selectors/editor-selectors';

test.describe( 'Verify floating buttons editor, admin page and front page behavior', () => {
	test( 'Verify editor behavior by creating post through API and also FE behavior', async (
		{
			browser,
			page,
			apiRequests,
		}, testInfo ) => {
		const floatingElPage = new FloatingElementPage( page, testInfo, apiRequests );
		const editor = await floatingElPage.goToFloatingButtonElementorEditor();
		await floatingElPage.waitForPanel();

		await test.step( 'Check that the editor has no button to Add Element and no navigator', async () => {
			const navigator = page.locator( 'header [aria-label="Structure"]' );
			await expect( navigator ).toBeHidden();
			const addButton = page.locator( 'header [aria-label="Add Element"]' );
			await expect( addButton ).toBeHidden();
		} );

		await test.step( 'Check that the floating element has been selected correctly when opening.', async () => {
			const panelTitle = page.locator( '#elementor-panel-header-title' );
			await expect( panelTitle ).toHaveText( 'Edit Single Chat' );
		} );

		const advancedSettingsCustom = page.locator( '.elementor-tab-control-advanced-tab-floating-buttons' );

		await test.step( 'Check that we are displaying three tabs for the widget, and that we are displaying our custom Advenced Tab.', async () => {
			const panelTitle = page.locator( '#elementor-panel-header-title' );
			await expect( panelTitle ).toHaveText( 'Edit Single Chat' );
			const navigationContainer = page.locator( '.elementor-panel-navigation' );
			const buttons = navigationContainer.locator( 'button' );
			const visibleButtons = buttons.filter( { has: page.locator( ':visible' ) } );
			await expect( visibleButtons ).toHaveCount( 3 );
			await expect( advancedSettingsCustom ).toBeVisible();
		} );

		await test.step( 'Check that  our custom advanced tab has the five expected sections and no others.', async () => {
			await advancedSettingsCustom.click();
			const elementorControlsContainer = page.locator( '#elementor-controls' );

			EditorSelectors.floatingElements.floatingButtons.controls.advanced.sections.forEach( async ( control ) => {
				const element = elementorControlsContainer.locator( control );
				await expect( element ).toBeVisible();
			} );

			const sections = elementorControlsContainer.locator( '.elementor-control-type-section' );
			await expect( sections ).toHaveCount( 5 );
		} );

		await test.step( 'Check that there is no section to add widget.', async () => {
			const addNewWidget = editor.getPreviewFrame().locator( EditorSelectors.addNewSection );
			await expect( addNewWidget ).toBeHidden();
		} );

		await test.step(
			'Check that we have a container wrapping our widget. There is only one action button, the Delete button. Clicking it should open the library modal.',
			async () => {
				const container = editor.getPreviewFrame().locator( EditorSelectors.container );
				await expect( container ).toBeVisible();

				const contactButtonWidget = container.locator( EditorSelectors.getWidgetByName( 'contact-buttons' ) );
				await expect( contactButtonWidget ).toBeVisible();

				const contactButtonActionsContainer = container.locator( '.elementor-editor-container-settings' );
				const actions = contactButtonActionsContainer.locator( 'li' );
				await expect( actions ).toHaveCount( 1 );

				const contactButtonElement = editor.getPreviewFrame().locator( '.elementor-widget-container .e-contact-buttons' );

				await contactButtonElement.hover();
				const deleteContainer = contactButtonActionsContainer.locator( '.elementor-editor-element-remove' );
				await deleteContainer.click();
				const libraryModal = page.locator( '#elementor-template-library-modal' );
				await expect( libraryModal ).toBeVisible();
			} );

		let floatingElement, context, newPage;

		await test.step( 'Verify that Setting as entire site displays the Widget on the FE. Check the snapshot for visual regression.', async () => {
			await floatingElPage.goToFloatingButtonsPage();
			const floatingElementTitle = page.locator( '.wp-list-table a.row-title:has-text("Floating Button")' );
			await floatingElementTitle.hover();
			const setAsEntireSite = page.locator( '#post-50 .row-actions .set_as_entire_site' );
			await expect( setAsEntireSite ).toBeVisible();
			await setAsEntireSite.click();
			await page.waitForURL( '/wp-admin/edit.php?post_type=e-floating-buttons' );

			context = await browser.newContext();
			newPage = await context.newPage();
			await newPage.goto( '/' );
			floatingElement = newPage.locator( '.e-contact-buttons' );
			await expect( floatingElement ).toBeVisible();

			expect( await floatingElement.screenshot(
				{
					type: 'png',
				},
			) ).toMatchSnapshot( 'floating-element.png' );
		} );

		await test.step( 'Check that click tracking works as expected.', async () => {
			const button = floatingElement.locator( '.e-contact-buttons__chat-button' );
			await expect( button ).toBeVisible();
			await button.click();
			const cta = floatingElement.locator( '.e-contact-buttons__send-button' );
			await expect( cta ).toBeVisible();
			for ( let i = 0; i < 10; i++ ) {
				const [ tabOpenedByButton ] = await Promise.all( [
					context.waitForEvent( 'page' ),
					// Perform the action that triggers the new tab, e.g., clicking a link
					cta.click(),
				] );
				expect( tabOpenedByButton ).not.toBeNull();
				await tabOpenedByButton.waitForLoadState( 'domcontentloaded' );
				await tabOpenedByButton.close();
			}

			await newPage.close();

			await floatingElPage.goToFloatingButtonsPage();
			const columnClickTracking = page.locator( '#post-50 td.column-click_tracking' );
			await expect( columnClickTracking ).toHaveText( '10' );
		} );
	} );

	test( 'Verify floating elements admin page behavior', async ( {
		page,
		apiRequests,
	}, testInfo ) => {
		const floatingElPage = new FloatingElementPage( page, testInfo, apiRequests );
		await floatingElPage.goToFloatingButtonsPage();

		const addNewButton = page.locator( '.e-admin-top-bar__main-area-buttons a' );

		await test.step( 'Check that buttons and top bar exists', async () => {
			await expect( addNewButton ).toBeVisible();
			const topBar = page.locator( '#e-admin-top-bar-root' );
			await expect( topBar ).toBeVisible();
		} );

		await test.step(
			'Verify that creating a new floating element works as expected. Starting the process opens a Modal',
			async () => {
				await addNewButton.click();
				const modal = page.locator( '#elementor-new-floating-elements-modal' );
				await expect( modal ).toBeVisible();

				const optionsField = page.locator( 'select[name="meta[_elementor_floating_elements_type]"] option' );
				await expect( optionsField ).toHaveCount( 2 );

				const hiddenField = page.locator( '#elementor-new-floating-elements__form input[name="post_type"]' );
				await expect( hiddenField ).toHaveAttribute( 'value', 'e-floating-buttons' );

				const titleField = page.locator( 'input[name="post_data[post_title]"]' );
				await expect( titleField ).toBeVisible();
				await titleField.fill( 'New Floating Button' );

				const createElement = page.locator( '#elementor-new-floating-elements__form__submit' );
				await createElement.click();
				await page.waitForURL( /\/wp-admin\/post\.php\?post=\d+&action=elementor&floating_element=floating-buttons/ );
			} );

		await test.step(
			'The modal closes and the editor opens when data is submitted. The library modal redirects to the admin when closing.',
			async () => {
				const libraryModal = page.locator( '#elementor-template-library-modal' );
				await expect( libraryModal ).toBeVisible();
				const footerSelector = '.elementor-template-library-template-footer';
				const footer = page.locator( footerSelector );
				await page.hover( '.elementor-template-library-template' );
				await page.waitForSelector( footerSelector );
				await expect( footer.first() ).toBeVisible();

				const closeIcon = page.locator( '.elementor-templates-modal__header__close i' );
				await expect( closeIcon ).toHaveAttribute( 'title', 'Go To Dashboard' );
				await closeIcon.click();
				await page.waitForURL( '/wp-admin/edit.php?post_type=e-floating-buttons' );
			} );

		await test.step(
			'Verify that the correct title and type are set for the floating element',
			async () => {
				const floatingElementTitle = page.locator( '.wp-list-table a.row-title:has-text("New Floating Button")' );
				await expect( floatingElementTitle ).toBeVisible();
				await expect( page.locator( '.wp-list-table td.elementor_library_type:has-text("Floating Buttons")' ) ).toHaveCount( 2 );
			} );
	} );
} );
