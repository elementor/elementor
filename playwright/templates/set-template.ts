import { Page } from '@playwright/test';
import WpAdminPage from '../../tests/playwright/pages/wp-admin-page';

const templates = {
	defaultV4: './playwright/templates/default-v4.json',
	default: './tests/playwright/templates/rating-flex-wrap.json',
} as const;

export const setTemplate = async ( page: Page, template: keyof typeof templates ): Promise<string | undefined> => {
	const wpAdmin = new WpAdminPage( page );
	const editorPage = await wpAdmin.openNewPage( false, false );
	editorPage.loadTemplate( templates[ template ] );
	return `${ editorPage.postId }`;
};

export const setDefaultTemplate = async ( page: Page, isV4 = true ): Promise<string | undefined> => {
	return setTemplate( page, isV4 ? 'defaultV4' : 'default' );
};
