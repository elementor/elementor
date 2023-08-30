import EditorSelectors from '../../../../../../../../selectors/editor-selectors';
import { expect, Page } from '@playwright/test';

export const findPromptHistoryButton = async ( page: Page ) => {
	await page.locator( EditorSelectors.ai.aiButton ).click( { force: true } );

	await expect( page.locator( EditorSelectors.ai.promptHistory.button ) ).toHaveCount( 1 );
};

export const openPromptHistory = async ( page: Page ) => {
	await page.locator( EditorSelectors.ai.aiButton ).click( { force: true } );

	await page.locator( EditorSelectors.ai.promptHistory.button ).click();
};

export const closePromptHistory = async ( page: Page ) => {
	await page.locator( EditorSelectors.ai.promptHistory.closeButton ).click();
};
