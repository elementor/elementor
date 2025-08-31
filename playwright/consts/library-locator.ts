import { Page } from '@playwright/test';

export const libraryLocator = '#elementor-template-library-modal';
export const pageLibraryLocator = ( page: Page ) => page.locator( libraryLocator );
