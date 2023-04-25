const { expect } = require( '@playwright/test' );
const { viewportSize } = require( '../../../../enums/viewport-sizes' );
const { firstTabTitleHasId } = require( '../helper' );

async function testResponsiveIdHandling( page, editor ) {
	// Arrange.
	let hasDesktopTabTitleId = await firstTabTitleHasId( editor.getPreviewFrame(), '.e-normal' ),
		hasMobileTabTitleId = await firstTabTitleHasId( editor.getPreviewFrame(), '.e-collapse' );

	// Assert.
	await expect( hasDesktopTabTitleId ).toBeTruthy();
	await expect( hasMobileTabTitleId ).toBeFalsy();

	// Arrange.
	await editor.setResponsiveViewInEditor( 'mobile' );

	hasDesktopTabTitleId = await firstTabTitleHasId( editor.getPreviewFrame(), '.e-normal' );
	hasMobileTabTitleId = await firstTabTitleHasId( editor.getPreviewFrame(), '.e-collapse' );

	// Assert.
	await expect( hasDesktopTabTitleId ).toBeFalsy();
	await expect( hasMobileTabTitleId ).toBeTruthy();

	// Arrange.
	await editor.publishAndViewPage();

	hasDesktopTabTitleId = await firstTabTitleHasId( page, '.e-normal' );
	hasMobileTabTitleId = await firstTabTitleHasId( page, '.e-collapse' );

	// Assert.
	await expect( hasDesktopTabTitleId ).toBeTruthy();
	await expect( hasMobileTabTitleId ).toBeFalsy();

	// Arrange.
	await page.setViewportSize( viewportSize.mobile );

	hasDesktopTabTitleId = await firstTabTitleHasId( page, '.e-normal' );
	hasMobileTabTitleId = await firstTabTitleHasId( page, '.e-collapse' );

	// Assert.
	await expect( hasDesktopTabTitleId ).toBeFalsy();
	await expect( hasMobileTabTitleId ).toBeTruthy();

	await page.setViewportSize( viewportSize.desktop );
	await editor.returnFromFrontendToEditor();
}

module.exports = {
	testResponsiveIdHandling,
};
