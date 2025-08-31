import { Page } from '@playwright/test';

export const canvasLocator = '#elementor-preview-iframe';
export const canvasPageFrameLocator = ( page: Page ) => page.frameLocator( canvasLocator );
