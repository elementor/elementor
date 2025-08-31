import { Page } from '@playwright/test';
import { editorPanelHeaderWrapperLocator } from '../consts/editor';

export const goToEditor = async ( page: Page, postId: string ) => {
	await page.goto( `/wp-admin/post.php?post=${ postId }&action=elementor` );
};

export const openNewPage = async ( page: Page ) => {
	await page.goto( `/wp-admin/post-new.php?post_type=page` );
	return await extractPageId( page );
};

export const openNewPost = async ( page: Page ) => {
	await page.goto( `/wp-admin/post-new.php` );
	return await extractPageId( page );
};

const extractPageId = async ( page: Page ) => {
	try {
		await page.getByRole( 'button', { name: 'Close' } ).filter( { visible: true } ).click( { timeout: 1000 } );
	} catch ( error ) {
		// eslint-disable-next-line no-console
		console.log( 'Welcome to the editor message not found, skipping' );
	}
	await page.locator( '#elementor-switch-mode-button' ).or( page.locator( '#elementor-edit-mode-button' ) ).click();
	await page.waitForSelector( editorPanelHeaderWrapperLocator, { state: 'visible', timeout: 10000 } );
	await page.waitForTimeout( 1000 );
	return page.url().split( 'post=' )[ 1 ].split( '&' )[ 0 ];
};
