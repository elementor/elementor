import BasePage from '../base-page';
import TypographySettings from './typography-settings';
import { type Page, type TestInfo } from '@playwright/test';

export default class StyleTab extends BasePage {
	readonly typography: TypographySettings;

	constructor( page: Page, testInfo: TestInfo ) {
		super( page, testInfo );
		this.typography = new TypographySettings( page, testInfo );
	}
}
