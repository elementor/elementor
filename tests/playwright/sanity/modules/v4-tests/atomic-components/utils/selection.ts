import { expect, Page } from '@playwright/test';
import EditorSelectors from '../../../../../selectors/editor-selectors';
import { timeouts } from '../../../../../config/timeouts';
import EditorPage from '../../../../../pages/editor-page';

export const selectComponentInstance = async ( editor: EditorPage, index: 'first' | 'last' = 'first' ) => {
	const instanceSelector = EditorSelectors.components.instanceWidget;
	const topLevelSelector = `${ instanceSelector }:not(${ instanceSelector } ${ instanceSelector })`;
	const locator = editor.getPreviewFrame().locator( topLevelSelector );
	const instance = 'first' === index ? locator.first() : locator.last();

	await instance.waitFor( { state: 'visible', timeout: timeouts.longAction } );

	const elementId = await instance.getAttribute( 'data-id' );
	await expect( async () => {
		await editor.selectElement( elementId );
	} ).toPass( { timeout: timeouts.longAction } );
};

export const getInstancePanelPropInput = async ( page: Page, propLabel: string ) => {
	const instancePanel = page.locator( EditorSelectors.components.instanceEditingPanel );

	await expect( instancePanel ).toBeVisible( { timeout: timeouts.longAction } );
	await expect( instancePanel.getByText( propLabel, { exact: true } ) ).toBeVisible();

	return instancePanel.getByRole( 'textbox' ).first();
};
