import { expect, Locator, Page } from '@playwright/test';
import EditorSelectors from '../../../../../selectors/editor-selectors';
import { timeouts } from '../../../../../config/timeouts';
import EditorPage from '../../../../../pages/editor-page';
import { waitForAutosave } from './creation';

export const exitComponentEditMode = async ( editor: EditorPage ) => {
	const backButton = editor.page.locator( EditorSelectors.components.exitEditModeButton );
	await backButton.click();

	const backdrop = editor.getPreviewFrame().getByRole( 'button', { name: 'Exit component editing mode' } );
	await waitForAutosave( editor.page );
	await expect( backdrop ).not.toBeVisible( { timeout: timeouts.longAction } );
};

export const openComponentsTab = async ( editor: EditorPage, page: Page ) => {
	await editor.openElementsPanel();

	const componentsTab = page.locator( EditorSelectors.components.componentsTab );
	await componentsTab.click();
};

export const openCreateComponentFromContextMenu = async ( element: Locator, page: Page ) => {
	await element.click( { button: 'right' } );

	await page.waitForSelector( EditorSelectors.contextMenu.menu );
	await page.getByRole( 'menuitem', { name: 'Create component' } ).click();
};
