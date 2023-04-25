const { expect } = require( '@playwright/test' );
const { viewportSize } = require( '../../../../enums/viewport-sizes' );
const { hasFirstTabTitleId } = require( '../helper' );

async function testResponsiveIdHandling( page, editor ) {
	// Arrange.
	let hasDesktopTabTitleId = await hasFirstTabTitleId( editor.getPreviewFrame(), '.e-normal' ),
		hasMobileTabTitleId = await hasFirstTabTitleId( editor.getPreviewFrame(), '.e-collapse' );

	// Assert.
	await expect( hasDesktopTabTitleId ).toBeTruthy();
	await expect( hasMobileTabTitleId ).toBeFalsy();

	// Arrange.
	await editor.setResponsiveViewInEditor( 'mobile' );
	await page.pause();

	hasDesktopTabTitleId = await hasFirstTabTitleId( editor.getPreviewFrame(), '.e-normal' );
	hasMobileTabTitleId = await hasFirstTabTitleId( editor.getPreviewFrame(), '.e-collapse' );

	// Assert.
	await expect( hasDesktopTabTitleId ).toBeFalsy();
	await expect( hasMobileTabTitleId ).toBeTruthy();

	// Arrange.
	await editor.publishAndViewPage();

	hasDesktopTabTitleId = await hasFirstTabTitleId( page, '.e-normal' );
	hasMobileTabTitleId = await hasFirstTabTitleId( page, '.e-collapse' );

	// Assert.
	await expect( hasDesktopTabTitleId ).toBeTruthy();
	await expect( hasMobileTabTitleId ).toBeFalsy();

	// Arrange.
	await page.setViewportSize( viewportSize.mobile );

	hasDesktopTabTitleId = await hasFirstTabTitleId( page, '.e-normal' );
	hasMobileTabTitleId = await hasFirstTabTitleId( page, '.e-collapse' );

	// Assert.
	await expect( hasDesktopTabTitleId ).toBeFalsy();
	await expect( hasMobileTabTitleId ).toBeTruthy();

	await page.setViewportSize( viewportSize.desktop );
	await editor.returnFromFrontendToEditor();
}

module.exports = {
	testResponsiveIdHandling,
};
