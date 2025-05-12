import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../../../parallelTest';
import EditorSelectors from '../../../../../selectors/editor-selectors';
test.describe( 'Onboarding Skip disabled until Hello Theme loaded', async () => {
	test( 'Onboarding Skip disabled until Hello Theme loaded', async ( { page } ) => {
		await page.goto( '/wp-admin/admin.php?page=elementor-app#onboarding/hello' );
		await page.waitForSelector( 'text=Skip' );

		const skipButton = page.locator( 'text=Skip' );

		await page.locator( EditorSelectors.onboarding.upgradeButton ).click();
		await expect( skipButton ).toHaveClass( /e-onboarding__button-skip--disabled/ );
	} );
} );
