import { chromium, type FullConfig } from '@playwright/test';
import { editorPanelHeaderWrapperLocator } from './consts/editor';

async function globalSetup( config: FullConfig ) {
	const { baseURL } = config.projects[ 0 ].use;
	const browser = await chromium.launch();
	const page = await browser.newPage();
	await page.goto( baseURL + '/wp-admin/post.php?post=1&action=elementor' );
	await page.waitForSelector( editorPanelHeaderWrapperLocator, { state: 'visible', timeout: 10000 } );
	await page.waitForTimeout( 1000 );
	await browser.close();
}

export default globalSetup;
