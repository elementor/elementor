import { Page } from '@playwright/test';
import { importTemplate } from '../pages';

const templates = {
	defaultV4: './playwright/templates/default-v4.json',
	default: './tests/playwright/templates/rating-flex-wrap.json',
} as const;

export const setTemplate = async ( page: Page, template: keyof typeof templates ): Promise<string | undefined> => {
	return await importTemplate( page, template, templates[ template ] );
};

export const setDefaultTemplate = async ( page: Page, isV4 = true ): Promise<string | undefined> => {
	return setTemplate( page, isV4 ? 'defaultV4' : 'default' );
};
