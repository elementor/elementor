import { Page } from '@playwright/test';

/**
 * Activate an experiment
 * @param {Page}                                page
 * @param {string}                              experiment - Should be the exact e_NAME
 * @param {('active' | 'inactive' | 'default')} state      - The state of the experiment
 */
export const setExperiment = async ( page: Page, experiment: string, state: 'active' | 'inactive' | 'default' = 'active' ) => {
	await page.goto( '/wp-admin/admin.php?page=elementor-settings#tab-experiments' );
	const experimentElement = page.locator( `.elementor_experiment-${ experiment }` );
	if ( await experimentElement.isVisible() ) {
		await experimentElement.locator( 'select' ).selectOption( state );
        await page.click('#submit');
        await page.waitForLoadState('load');
	}
};
