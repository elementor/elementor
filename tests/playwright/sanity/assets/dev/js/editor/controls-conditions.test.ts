import { test, expect } from '@playwright/test';
import WpAdminPage from '../../../../../pages/wp-admin-page';

/**
 *  Test that conditioned responsive controls appear when their conditioning control inherits a value from a parent.
 */
test( 'Editor Responsive Control Conditions', async ( { page }, testInfo ) => {
	// Arrange.
	const wpAdmin = new WpAdminPage( page, testInfo ),
		editor = await wpAdmin.openNewPage();

	await editor.addWidget( 'heading' );

	const heading = await editor.getPreviewFrame().waitForSelector( 'text=Add Your Heading Text Here' );

	await heading.hover();

	const sectionEditButton = await editor.getPreviewFrame().waitForSelector( '.elementor-editor-element-edit' );

	// Open the containing section.
	await sectionEditButton.click();

	// Go to the style tab.
	const styleTabButton = await page.waitForSelector( '.elementor-tab-control-style' );

	await styleTabButton.click();

	// Select classic background.
	const backgroundClassicButton = await page.waitForSelector( '.elementor-control-background_background label[data-tooltip="Classic"]' );

	await backgroundClassicButton.click();

	// Go to mobile device mode.
	const responsiveSwitcher = await page.waitForSelector( '.elementor-control-background_image .elementor-responsive-switcher' );

	await responsiveSwitcher.click();

	const mobileSwitcherButton = await page.waitForSelector( '.elementor-control-background_image .elementor-responsive-switcher-mobile' );

	await mobileSwitcherButton.click();

	const mediaControlPreview = page.locator( '.elementor-control-background_image_mobile .elementor-control-media-area' );

	await mediaControlPreview.hover( { position: { x: 10, y: 10 } } );

	const mediaControlUploadButton = await page.waitForSelector( '.elementor-control-background_image_mobile .elementor-control-media__tool' );

	await mediaControlUploadButton.click( { position: { x: 5, y: 5 } } );

	await page.waitForSelector( 'text=Insert Media' );
	await page.waitForTimeout( 1000 );

	// Check if previous image is already uploaded.
	const mountainImageName = 'Picsum ID: 684',
		previousImage = page.getByRole( 'checkbox', { name: mountainImageName } );

	if ( await previousImage.nth( 0 ).isVisible() ) {
		await previousImage.nth( 0 ).click();
	} else {
		await page.setInputFiles( 'input[type="file"]', './tests/playwright/resources/mountain-image.jpeg' );
		await page.waitForSelector( 'text=ATTACHMENT DETAILS' );
	}

	// Select Image
	await page.click( '.button.media-button' );

	const backgroundPositionControl = page.locator( '.elementor-control-background_position_mobile' );

	await expect( backgroundPositionControl ).toBeVisible();

	await editor.setSelectControlValue( 'background_size_mobile', 'initial' );

	const customBackgroundSizeControl = page.locator( '.elementor-control-background_bg_width_mobile' );

	await expect( customBackgroundSizeControl ).toBeVisible();
} );
