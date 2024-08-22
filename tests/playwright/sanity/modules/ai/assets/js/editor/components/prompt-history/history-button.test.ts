import { Page } from '@playwright/test';
import { parallelTest as test } from '../../../../../../../../parallelTest';
import { closeAIDialog, findPromptHistoryButton } from './helper';
import { userInformationMock } from '../../../../../user-information.mock';
import WpAdminPage from '../../../../../../../../pages/wp-admin-page';

test.describe( 'AI @ai', () => {
	const mockRoute = async ( page: Page ) => {
		await page.route( '/wp-admin/admin-ajax.php', async ( route ) => {
			const requestPostData = route.request().postData();

			if ( requestPostData.includes( 'ai_get_user_information' ) ) {
				await route.fulfill( {
					json: userInformationMock,
				} );
			}
		} );
	};

	test( 'Prompt History Button', async ( { page, apiRequests }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );

		const editor = await wpAdmin.openNewPage();

		await mockRoute( page );

		await test.step( 'Textarea control', async () => {
			await editor.addWidget( 'heading' );

			await findPromptHistoryButton( page );

			await closeAIDialog( page );
		} );

		await test.step( 'Wysiwyg control', async () => {
			await editor.addWidget( 'text-editor' );

			await findPromptHistoryButton( page );

			await closeAIDialog( page );
		} );

		await test.step( 'HTML control', async () => {
			await editor.addWidget( 'html' );

			await findPromptHistoryButton( page );

			await closeAIDialog( page );
		} );

		await test.step( 'Image control', async () => {
			await editor.addWidget( 'image' );

			await findPromptHistoryButton( page );

			await closeAIDialog( page );
		} );

		await test.step( 'Image box', async () => {
			await editor.addWidget( 'image-box' );

			await findPromptHistoryButton( page );

			await closeAIDialog( page );
		} );
	} );
} );
