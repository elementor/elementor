import BasePage from '../base-page';
import TypographySettings from './typography-settings';
import { type Page, type TestInfo } from '@playwright/test';

export const STYLE_SECTIONS = {
	SIZE: 'Size',
	TYPOGRAPHY: 'Typography',
	LAYOUT: 'Layout',
	SPACING: 'Spacing',
	POSITION: 'Position',
	BACKGROUND: 'Background',
	BORDER: 'Border',
	EFFECTS: 'Effects',
} as const;

export type StyleSection = typeof STYLE_SECTIONS[keyof typeof STYLE_SECTIONS];

export default class StyleTab extends BasePage {
	readonly typography: TypographySettings;

	constructor( page: Page, testInfo: TestInfo ) {
		super( page, testInfo );
		this.typography = new TypographySettings( page, testInfo );
	}

	async expandShowMoreIfNeeded( section: StyleSection ): Promise<void> {
		// Try to find the show more button using the new aria-label format
		const content = this.page.locator( `[aria-label="${ section } section content"]` );
		const showMoreButton = content.locator( '[aria-label="Show more"]' );

		// Wait a bit for the element to be available
		await showMoreButton.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {
			// If not found with new format, try old format
			const oldFormatButton = this.page.locator( `text=${ section }` ).locator( '..' ).locator( 'button', { hasText: 'Show more' } );
			return oldFormatButton.waitFor({ state: 'visible', timeout: 5000 });
		});

		if ( await showMoreButton.isVisible() ) {
			await showMoreButton.click();
		}
	}

	async clickShowMore( sectionName: string ): Promise<void> {
		// Try both old and new aria-label formats
		const content = this.page.locator( `[aria-label="${ sectionName } section content"]` );
		const showMoreBtn = content.locator( '[aria-label="Show more"]' );

		// Wait for the show more button to be visible
		await showMoreBtn.waitFor({ state: 'visible', timeout: 10000 });
		await showMoreBtn.click();
	}
}
