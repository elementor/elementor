import { expect, Page } from '@playwright/test';
import EditorSelectors from '../../../../../selectors/editor-selectors';
import { timeouts } from '../../../../../config/timeouts';
import EditorPage from '../../../../../pages/editor-page';

export const exitComponentEditMode = async ( editor: EditorPage ) => {
	const backButton = editor.page.locator( EditorSelectors.components.exitEditModeButton );
	await backButton.click();
	const backdrop = editor.getPreviewFrame().getByRole( 'button', { name: 'Exit component editing mode' } );
	await expect( backdrop ).not.toBeVisible( { timeout: timeouts.longAction } );
};

export const openComponentsTab = async ( editor: EditorPage, page: Page ) => {
	await editor.openElementsPanel();

	const componentsTab = page.locator( EditorSelectors.components.componentsTab );
	await componentsTab.click();
};
