import { expect, Locator, Page } from '@playwright/test';
import EditorSelectors from '../../../../../selectors/editor-selectors';
import { timeouts } from '../../../../../config/timeouts';

export const uniqueName = ( baseName: string ) => `${ baseName } ${ Date.now() }`;

export const createComponent = async ( page: Page, componentName: string ) => {
	const createComponentForm = page.locator( EditorSelectors.components.createComponentForm );
	await expect( createComponentForm ).toBeVisible();

	const nameInput = createComponentForm.getByRole( 'textbox' ).first();
	await nameInput.clear();
	await nameInput.fill( componentName );

	const createButton = createComponentForm.getByRole( 'button', { name: 'Create' } );
	await createButton.click();

	const panelHeader = page.locator( EditorSelectors.components.editModeHeader );
	await expect( panelHeader ).toBeVisible( { timeout: timeouts.longAction } );

	await dismissOnboardingDialog( page );
};

export const createOverridableProp = async ( page: Page, propLabel: string, index: number = 0 ) => {
	const exposeIndicator = page.locator( EditorSelectors.components.overridableIndicator ).nth( index );
	await exposeIndicator.click();

	const overridablePropForm = page.locator( EditorSelectors.components.overridablePropForm );
	await overridablePropForm.waitFor( { state: 'visible', timeout: timeouts.longAction } );

	const labelInput = overridablePropForm.getByRole( 'textbox' ).first();
	await labelInput.fill( propLabel );

	const confirmButton = page.getByRole( 'button', { name: 'Create' } );
	await confirmButton.click();

	await overridablePropForm.waitFor( { state: 'hidden', timeout: timeouts.longAction } );
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

