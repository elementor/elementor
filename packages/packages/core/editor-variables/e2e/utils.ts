import { type Page } from '@playwright/test';

export const openVariableManager = async ( page: Page ) => {
	await page.getByRole( 'button', { name: 'Variables' } ).click();
};
