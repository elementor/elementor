import { expect, type Page } from '@playwright/test';
import { parallelTest as test } from '../../../parallelTest';
import WpAdminPage from '../../../pages/wp-admin-page';
import { userInformationMock } from './user-information.mock';
import {
	completionTextMock,
	editTextMock,
} from './text.mock';

test.describe( 'AI @ai', () => {
	const mockRoute = async ( page: Page ) => {
		await page.route( '/wp-admin/admin-ajax.php', async ( route ) => {
			const requestPostData = route.request().postData();

			if ( requestPostData.includes( 'ai_get_user_information' ) ) {
				await route.fulfill( {
					json: userInformationMock,
				} );
			}

			if ( requestPostData.includes( 'ai_get_completion_text' ) ) {
				await route.fulfill( {
					json: completionTextMock,
				} );
			}

			if ( requestPostData.includes( 'ai_get_edit_text' ) ) {
				await route.fulfill( {
					json: editTextMock,
				} );
			}
		} );
	};

	test( 'Text', async ( { page, apiRequests }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );

		const editor = await wpAdmin.openNewPage();

		await test.step( 'Open the modal with default value from the control', async () => {
			await editor.addWidget( 'heading' );

			await page.click( '.e-ai-button' );

			await mockRoute( page );

			const generateTextButton = page.getByText( 'Generate text' );

			await expect( generateTextButton ).toHaveCount( 1 );
			await expect( page.getByText( 'Suggested prompts:' ) ).toHaveCount( 1 );

			await page.locator( 'input[name="prompt"]' ).fill( 'Some prompt' );

			await expect( page.getByText( 'Suggested prompts:' ) ).toHaveCount( 0 );

			await generateTextButton.click();

			const useTextButton = page.getByText( 'Use text' );

			await expect( useTextButton ).toHaveCount( 1 );
			await expect( page.getByText( 'Response Prompt' ) ).toHaveCount( 1 );

			const newPromptButton = page.getByText( 'New prompt' );
			await expect( newPromptButton ).toHaveCount( 1 );

			await newPromptButton.click();

			expect( await page.locator( 'input[name="prompt"]' ).inputValue() ).toBe( 'Some prompt' );
			await expect( page.getByText( 'Suggested prompts:' ) ).toHaveCount( 0 );
			await generateTextButton.click();

			await expect( useTextButton ).toHaveCount( 1 );
			await expect( page.getByText( 'Response Prompt' ) ).toHaveCount( 1 );

			await page.getByText( 'Make it shorter' ).click();

			await expect( page.getByText( 'Response Prompt Shorter' ) ).toHaveCount( 1 );

			await useTextButton.click();

			const inputControl = page.locator( '.elementor-control-title.elementor-control-type-textarea textarea' );
			expect( await inputControl.inputValue() ).toBe( 'Response Prompt Shorter' );
		} );

		await test.step( 'Open the modal with non-default value from the control', async () => {
			await editor.addWidget( 'heading' );
			await editor.setTextareaControlValue( 'title', 'Hello World' );

			await page.click( '.e-ai-button' );

			await mockRoute( page );

			await expect( page.getByText( 'Use text' ) ).toHaveCount( 1 );
			await expect( page.getByText( 'Hello World' ) ).toHaveCount( 1 );

			await page.locator( 'button[aria-label="close"]' ).click();
		} );
	} );
} );
