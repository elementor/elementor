import { expect, Page } from '@playwright/test';
import EditorSelectors from '../../../../../selectors/editor-selectors';
import { timeouts } from '../../../../../config/timeouts';
import EditorPage from '../../../../../pages/editor-page';

export const selectComponentInstance = async ( editor: EditorPage, elementId: string ): Promise< void > => {
	const componentInstance = editor.getPreviewFrame().locator( `[data-widget_type="e-component.default"][data-id="${ elementId }"]` );

	await componentInstance.click();
};

export const getInstancePanelPropInput = async ( page: Page, propLabel: string ): Promise< ReturnType< typeof page.locator > > => {
	const instancePanel = page.locator( EditorSelectors.components.instanceEditingPanel );

	await expect( instancePanel ).toBeVisible( { timeout: timeouts.longAction } );
	await expect( instancePanel.getByText( propLabel, { exact: true } ) ).toBeVisible();

	return instancePanel.getByRole( 'textbox' ).first();
};

export const getNavigationItem = async ( page: Page, elementId: string ): Promise< ReturnType< typeof page.locator > > => {
	return page.locator( EditorSelectors.panels.navigator.getElementItem( elementId ) ).first();
};
