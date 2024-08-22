import EditorSelectors from '../../../../../../../../selectors/editor-selectors';
import { expect, Page } from '@playwright/test';

export const findPromptHistoryButton = async ( page: Page ) => {
	await page.locator( EditorSelectors.ai.aiButton ).first().click( { force: true } );

	await expect( page.locator( EditorSelectors.ai.promptHistory.button ) ).toHaveCount( 1 );
};

export const closeAIDialog = async ( page: Page ) => {
	await page.locator( EditorSelectors.ai.aiDialogCloseButton ).click();
};

export const openPromptHistory = async ( page: Page ) => {
	await page.locator( EditorSelectors.ai.aiButton ).first().click( { force: true } );

	await page.locator( EditorSelectors.ai.promptHistory.button ).click();
};

export const closePromptHistory = async ( page: Page ) => {
	await page.locator( EditorSelectors.ai.promptHistory.closeButton ).click();
};

export const waitForPromptHistoryItem = async ( page: Page ) => {
	await page.getByTestId( EditorSelectors.ai.promptHistory.itemTestId ).first().waitFor( { state: 'visible' } );
};
