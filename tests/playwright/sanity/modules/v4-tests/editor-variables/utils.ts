import { type Page } from '@playwright/test';
import EditorSelectors from '../../../../selectors/editor-selectors';

export const openVariableManager = async ( page: Page ) => {
	await page.frameLocator( EditorSelectors.canvas ).getByText( 'This is a title' ).click();
	await page.getByRole( 'button', { name: 'Style' } ).click();
	await page.getByRole( 'button', { name: 'Typography' } ).click();
	const fontFamilyControl = await page.locator( '#font-family-control' ).boundingBox();
	await page.mouse.move( fontFamilyControl.x, fontFamilyControl.y );
	await page.click( '#floating-action-bar' );
};
