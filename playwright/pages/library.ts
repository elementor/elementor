import { Page } from '@playwright/test';
import { openNewPage } from './editor';
import { canvasPageFrameLocator, pageLibraryLocator } from '../consts';

export const importTemplate = async ( page: Page, templateName: string, templatePath: string ): Promise<string | undefined> => {
	const newPageId = await openNewPage( page );
	await canvasPageFrameLocator( page ).getByRole( 'button', { name: 'Add Template' } ).click( { clickCount: 3, delay: 100 } );

	const libraryBaseLocator = pageLibraryLocator( page );
	await libraryBaseLocator.waitFor( { state: 'visible', timeout: 10000 } );
	await libraryBaseLocator.locator( '[data-tab="templates/my-templates"]' ).click();
	await libraryBaseLocator.locator( '#elementor-template-library-header-import' ).click();
	await libraryBaseLocator.locator( `#elementor-template-library-import-form-input` ).setInputFiles( templatePath );
	const warningMessage = page.locator( '.dialog-confirm-widget-content' ).locator( 'button:has-text("Continue")' );
	if ( await warningMessage.isVisible() ) {
		await warningMessage.click();
	}
	const validationMessage = page.locator( '.dialog-confirm-widget-content' ).locator( 'button:has-text("Enable and Import")' );
	if ( await validationMessage.isVisible() ) {
		await validationMessage.click();
	}
	await libraryBaseLocator.locator( '#elementor-template-library-templates-container' ).waitFor( { state: 'visible' } );
	const template = libraryBaseLocator.getByText( templateName );
	if ( template ) {
		await libraryBaseLocator.getByRole( 'button', { name: 'Insert' } ).click();
		return newPageId;
	}
	return undefined;
};
