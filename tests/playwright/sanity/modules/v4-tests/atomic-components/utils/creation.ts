import { expect, Locator, Page } from '@playwright/test';
import EditorSelectors from '../../../../../selectors/editor-selectors';
import { timeouts } from '../../../../../config/timeouts';
import EditorPage from '../../../../../pages/editor-page';

export const uniqueName = ( baseName: string ) => `${ baseName } ${ Date.now() }`;

export const createContentForComponent = async ( editor: EditorPage ) => {
	const flexboxId = await editor.addElement( { elType: EditorSelectors.v4.atoms.flexbox }, 'document' );
	await editor.addWidget( { widgetType: EditorSelectors.v4.atoms.heading, container: flexboxId } );

	const locator = editor.getPreviewFrame().locator( `[data-id="${ flexboxId }"]` );
	return { id: flexboxId, locator };
};

export const createComponent = async ( page: Page, componentName: string ) => {
	const createComponentForm = page.locator( EditorSelectors.components.createComponentForm );
	await expect( createComponentForm ).toBeVisible();

	const nameInput = createComponentForm.getByRole( 'textbox' ).first();
	await nameInput.clear();
	await nameInput.fill( componentName );

	const createButton = createComponentForm.getByRole( 'button', { name: 'Create' } );
	await createButton.click();
	await waitForAutosave( page );

	const panelHeader = page.locator( EditorSelectors.components.editModeHeader );
	await expect( panelHeader ).toBeVisible( { timeout: timeouts.longAction } );

	await dismissOnboardingDialog( page );
};

export const createOverridableProp = async ( page: Page, propLabel: string ) => {
	const exposeIndicator = page.locator( EditorSelectors.components.overridableIndicator ).first();
	await exposeIndicator.click();

	const overridablePropForm = page.locator( EditorSelectors.components.overridablePropForm );
	await overridablePropForm.waitFor( { state: 'visible', timeout: timeouts.longAction } );

	const labelInput = overridablePropForm.getByRole( 'textbox' ).first();
	await labelInput.fill( propLabel );

	const confirmButton = page.getByRole( 'button', { name: 'Create' } );
	await confirmButton.click();

	await overridablePropForm.waitFor( { state: 'hidden', timeout: timeouts.longAction } );
};

export const waitForAutosave = async ( page: Page ) => {
	return page.waitForResponse(
		( response ) => response.url().includes( '/wp-admin/admin-ajax.php' ) && 200 === response.status(),
	);
};

const dismissOnboardingDialog = async ( page: Page ) => {
	const onboardingDismiss = page.getByRole( 'button', { name: 'Got it' } );

	const isVisible = await isOnboardingDialogDisplayed( onboardingDismiss );
	if ( isVisible ) {
		await onboardingDismiss.click();
	}
};

const isOnboardingDialogDisplayed = async ( onboardingDismiss: Locator ) => {
	return onboardingDismiss.isVisible( { timeout: timeouts.longAction } ).catch( () => false );
};

