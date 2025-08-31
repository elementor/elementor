import { Page } from '@playwright/test';
import { importTemplate } from '../pages';

const templates = {
	default: './tests/playwright/templates/rating-flex-wrap.json',
} as const;

export const setTemplate = async ( page: Page, template: keyof typeof templates ): Promise<string | undefined> => {
	return await importTemplate( page, template, templates[ template ] );
};

export const setDefaultTemplate = async ( page: Page ): Promise<string | undefined> => {
	return setTemplate( page, 'default' );
};
