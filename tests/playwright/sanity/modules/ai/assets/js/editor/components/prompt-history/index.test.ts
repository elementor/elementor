import { Page, expect } from '@playwright/test';
import { parallelTest as test } from '../../../../../../../../parallelTest';
import {
	reuseAndEditTextDataMock,
	differentPeriodsDataMock,
	noDataMock,
	noPlanMock,
	thirtyDaysLimitDataMock,
	unknownActionDataMock, restoreImageDataMock,
} from './get-history.mock';
import { closeAIDialog, closePromptHistory, openPromptHistory, waitForPromptHistoryItem } from './helper';
import { userInformationMock } from '../../../../../user-information.mock';
import WpAdminPage from '../../../../../../../../pages/wp-admin-page';
import EditorSelectors from '../../../../../../../../selectors/editor-selectors';
import { successMock } from './delete-history-item.mock';
import AxeBuilder from '@axe-core/playwright';

test.describe( 'AI @ai', () => {
	const mockRoute = async ( page: Page, { getHistoryMock = {}, deleteHistoryMock = {} } ) => {
		await page.route( '/wp-admin/admin-ajax.php', async ( route ) => {
			const requestPostData = route.request().postData();

			if ( requestPostData.includes( 'ai_get_user_information' ) ) {
				await route.fulfill( {
					json: userInformationMock,
				} );
			}

			if ( requestPostData.includes( 'ai_get_history' ) ) {
				await route.fulfill( {
					json: getHistoryMock,
				} );
			}

			if ( requestPostData.includes( 'ai_delete_history_item' ) ) {
				await route.fulfill( {
					json: deleteHistoryMock,
				} );
			}
		} );
	};

	test( 'Prompt History - Common', async ( { page, apiRequests }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );

		const editor = await wpAdmin.openNewPage();

		await test.step( 'Modal can be opened and closed', async () => {
			await editor.addWidget( 'text-editor' );

			await mockRoute( page, { getHistoryMock: noDataMock } );

			await openPromptHistory( page );

			await expect( page.locator( EditorSelectors.ai.promptHistory.modal ).first() ).toBeVisible();

			await closePromptHistory( page );

			await expect( page.locator( EditorSelectors.ai.promptHistory.modal ).first() ).toBeHidden();

			await closeAIDialog( page );
		} );

		await test.step( 'Shows a message when there is a free plan', async () => {
			await editor.addWidget( 'text-editor' );

			await mockRoute( page, { getHistoryMock: noPlanMock } );

			await openPromptHistory( page );

			await expect( page.getByTestId( EditorSelectors.ai.promptHistory.upgradeMessageFullTestId ).first() ).toBeVisible();

			await closePromptHistory( page );

			await closeAIDialog( page );
		} );

		await test.step( 'Shows a message when there are no history items', async () => {
			await editor.addWidget( 'text-editor' );

			await mockRoute( page, { getHistoryMock: noDataMock } );

			await openPromptHistory( page );

			await expect( page.getByTestId( EditorSelectors.ai.promptHistory.noDataMessageTestId ).first() ).toBeVisible();

			await closePromptHistory( page );

			await closeAIDialog( page );
		} );

		await test.step( 'Renders items from different periods correctly', async () => {
			await editor.addWidget( 'text-editor' );

			await mockRoute( page, { getHistoryMock: differentPeriodsDataMock } );

			await openPromptHistory( page );

			await expect( page.getByTestId( EditorSelectors.ai.promptHistory.periodTestId ) ).toHaveCount( 2 );

			await expect( page.getByTestId( EditorSelectors.ai.promptHistory.itemTestId ) ).toHaveCount( 2 );

			await closePromptHistory( page );

			await closeAIDialog( page );
		} );

		await test.step( 'Renders upgrade ad if a user has less than 90 items limit', async () => {
			await editor.addWidget( 'text-editor' );

			await mockRoute( page, { getHistoryMock: thirtyDaysLimitDataMock } );

			await openPromptHistory( page );

			await expect( page.getByTestId( EditorSelectors.ai.promptHistory.upgradeMessageSmallTestId ).first() ).toBeVisible();

			await closePromptHistory( page );

			await closeAIDialog( page );
		} );

		await test.step( 'Renders a fallback icon for an unknown action', async () => {
			await editor.addWidget( 'text-editor' );

			await mockRoute( page, { getHistoryMock: unknownActionDataMock } );

			await openPromptHistory( page );

			await expect( page.getByTestId( EditorSelectors.ai.promptHistory.fallbackIconTestId ) ).toHaveCount( 1 );

			await closePromptHistory( page );

			await closeAIDialog( page );
		} );

		await test.step( 'Removes item', async () => {
			await editor.addWidget( 'text-editor' );

			await mockRoute( page, {
				getHistoryMock: differentPeriodsDataMock,
				deleteHistoryMock: successMock,
			} );

			await openPromptHistory( page );

			const items = page.getByTestId( EditorSelectors.ai.promptHistory.itemTestId );

			await expect( items ).toHaveCount( 2 );

			await items.first().hover();

			await items.first().locator( EditorSelectors.ai.promptHistory.removeButton ).click();

			await expect( items ).toHaveCount( 1 );

			await closePromptHistory( page );

			await closeAIDialog( page );
		} );
	} );

	test( 'Prompt History - a11y', async ( { page, apiRequests }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );

		const editor = await wpAdmin.openNewPage();

		await test.step( 'Text - History items list a11y', async () => {
			await editor.addWidget( 'text-editor' );

			await mockRoute( page, {
				getHistoryMock: differentPeriodsDataMock,
			} );

			await openPromptHistory( page );

			await waitForPromptHistoryItem( page );

			const accessibilityScanResults = await new AxeBuilder( { page } )
				.include( EditorSelectors.ai.promptHistory.modal )
				.analyze();

			expect( accessibilityScanResults.violations ).toEqual( [] );

			await closePromptHistory( page );
			await closeAIDialog( page );
		} );

		await test.step( 'Image - History items list a11y', async () => {
			await editor.addWidget( 'image' );

			await mockRoute( page, {
				getHistoryMock: restoreImageDataMock,
			} );

			await openPromptHistory( page );

			await waitForPromptHistoryItem( page );

			const accessibilityScanResults = await new AxeBuilder( { page } )
				.include( EditorSelectors.ai.promptHistory.modal )
				.analyze();

			expect( accessibilityScanResults.violations ).toEqual( [] );

			await closePromptHistory( page );
			await closeAIDialog( page );
		} );
	} );

	test( 'Prompt History - Text', async ( { page, apiRequests }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );

		const editor = await wpAdmin.openNewPage();

		await test.step( 'Reuse button reuses prompt', async () => {
			await editor.addWidget( 'text-editor' );

			await mockRoute( page, {
				getHistoryMock: reuseAndEditTextDataMock,
			} );

			await openPromptHistory( page );

			const item = page.getByTestId( EditorSelectors.ai.promptHistory.itemTestId ).first();

			await item.hover();

			await item.locator( EditorSelectors.ai.promptHistory.reuseButton ).click();

			const input = page.locator( EditorSelectors.ai.promptInput ).first();

			await expect( input ).toBeVisible();

			expect( await input.inputValue() ).toBe( 'Test prompt' );

			await closeAIDialog( page );
		} );

		await test.step( 'Edit button edits result', async () => {
			await editor.addWidget( 'text-editor' );

			await mockRoute( page, {
				getHistoryMock: reuseAndEditTextDataMock,
			} );

			await openPromptHistory( page );

			const item = page.getByTestId( EditorSelectors.ai.promptHistory.itemTestId ).first();

			await item.hover();

			await item.locator( EditorSelectors.ai.promptHistory.editButton ).click();

			const textarea = page.locator( EditorSelectors.ai.resultTextarea ).first();

			await expect( textarea ).toBeVisible();

			expect( await textarea.inputValue() ).toBe( 'Test result' );

			await closeAIDialog( page );
		} );
	} );

	test( 'Prompt History - Code', async ( { page, apiRequests }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );

		const editor = await wpAdmin.openNewPage();

		await test.step( 'Reuse button reuses prompt', async () => {
			await editor.addWidget( 'html' );

			await mockRoute( page, {
				getHistoryMock: reuseAndEditTextDataMock,
			} );

			await openPromptHistory( page );

			const item = page.getByTestId( EditorSelectors.ai.promptHistory.itemTestId ).first();

			await item.hover();

			await item.locator( EditorSelectors.ai.promptHistory.reuseButton ).click();

			const input = page.locator( EditorSelectors.ai.promptInput ).first();

			await expect( input ).toBeVisible();

			expect( await input.inputValue() ).toBe( 'Test prompt' );
		} );
	} );

	test( 'Prompt History - Image', async ( { page, apiRequests }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );

		const editor = await wpAdmin.openNewPage();

		await test.step( 'Restore button restores prompt', async () => {
			const { promptHistory, image } = EditorSelectors.ai;

			await editor.addWidget( 'image' );

			await mockRoute( page, {
				getHistoryMock: restoreImageDataMock,
			} );

			await openPromptHistory( page );

			const item = page.getByTestId( promptHistory.itemTestId ).first();

			await item.hover();

			await item.locator( promptHistory.restoreButton ).click();

			// Check prompt
			const promptTextarea = page.locator( image.promptTextarea ).first();

			await expect( promptTextarea ).toBeVisible();

			expect( await promptTextarea.inputValue() ).toBe( 'Test prompt' );

			// Check image type
			const imageTypeInput = page.locator( image.typeInput ).first();

			await expect( imageTypeInput ).toBeVisible();

			expect( await imageTypeInput.inputValue() ).toBe( 'photographic' );

			// Check image style
			const imageStyleInput = page.locator( image.styleInput ).first();

			await expect( imageStyleInput ).toBeVisible();

			expect( await imageStyleInput.inputValue() ).toBe( 'portrait' );

			// Check image ratio
			const imageRatioInput = page.locator( image.aspectRationInput ).first();

			await expect( imageRatioInput ).toBeVisible();

			expect( await imageRatioInput.inputValue() ).toBe( '16:9' );

			// Check restored images
			const images = page.locator( image.generatedImage );

			await images.first().waitFor( { state: 'visible' } );

			expect( await images.count() ).toEqual( 2 );

			expect( await images.first().getAttribute( 'src' ) ).toEqual( 'https://example.com/img1.jpg' );
		} );
	} );
} );
