import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../../../parallelTest';
import WpAdminPage from '../../../../../pages/wp-admin-page';
import { resolve } from 'path';

test.describe( 'URL Actions', () => {
	test( 'Test Lightbox and URL Actions', async ( { page, apiRequests }, testInfo ) => {
		/**
		 * Open new empty page.
		 */
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );

		const editor = await wpAdmin.openNewPage();

		const wpMediaAddButtonSelector = '.button.media-button';

		/**
		 * Add Image Widget and test lightbox in single image mode.
		 */
		await editor.addElement( {
			elType: 'widget',
			widgetType: 'image',
			settings: {
				link_to: 'file',
				open_lightbox: 'yes',
			},
		}, null );

		// Upload Image
		const imageMediaControl = page.locator( '.elementor-control-preview-area' );
		await imageMediaControl.click( { delay: 500, clickCount: 2 } );
		await page.click( 'text=Media Library' );
		await page.waitForSelector( 'text=Insert Media' );
		// Takes time to load the media library assets.
		await page.waitForTimeout( 1000 );

		// Check if previous image is already uploaded.
		const mountainImageName = 'Picsum ID: 684',
			previousImage = page.getByRole( 'checkbox', { name: mountainImageName } );

		if ( await previousImage.nth( 0 ).isVisible() ) {
			await previousImage.nth( 0 ).click();
		} else {
			await page.setInputFiles( 'input[type="file"]', resolve( __dirname, '../../../../../resources/mountain-image.jpeg' ) );
			await page.waitForSelector( 'text=mountain-image.jpeg' );
		}

		// Select the image.
		await page.click( wpMediaAddButtonSelector );

		// Get the image's source.
		const mountainImg = editor.getPreviewFrame().locator( '.elementor-widget-image img[src*="mountain-image"]' );
		const src = await mountainImg.getAttribute( 'src' );

		// Test that the image has been successfully inserted into the page.
		expect( src ).toContain( 'mountain-image' );

		// Click on the image to open the lightbox.
		await mountainImg.click();

		const singlelightboxImage = editor.getPreviewFrame().locator( '.elementor-lightbox-image' );

		// Test that the lightbox appeared.
		await expect( singlelightboxImage ).toBeVisible();

		// Remove the previous wp media frame so it doesn't interfere with the next one to be opened for the gallery.
		/**
		 * Cleanup
		 */
		await page.evaluate( () => {
			const wpMediaFrame = document.querySelector( '[id*="__wp-uploader-id"]' );
			wpMediaFrame.innerHTML = '';
			wpMediaFrame.remove();
		} );

		/**
		 * Add Basic Gallery Widget and test lightbox in slideshow mode.
		 *
		 * In this test, we use the image from the image test above, add another image to it, and open that in a lightbox.
		 */
		// Add Gallery Widget, to test lightbox slideshow mode.
		await editor.addElement( {
			elType: 'widget',
			widgetType: 'image-gallery',
			settings: {
				gallery_link: 'file',
				open_lightbox: 'yes',
			},
		} );

		await page.click( '.elementor-control-gallery-add' );
		await page.click( 'text=Media Library' );
		await page.waitForTimeout( 1000 );

		// Check if field image is already uploaded.
		const fieldImage = await page.$( '[aria-label="field-image"]' );

		if ( fieldImage ) {
			await page.click( '[aria-label*="field-image"]' );
		} else {
			// Upload and select the field image
			await page.click( 'text=Upload files' );
			await page.waitForSelector( 'text=Drop files to upload' );
			await page.setInputFiles( 'input[type="file"]', resolve( __dirname, '../../../../../resources/field-image.jpg' ) );
			// If this step is successful, the image should be already selected for the gallery.
			await page.waitForSelector( 'text=field-image.jpg' );
		}

		// Select the mountain image to add to the gallery.
		await previousImage.nth( 0 ).click();

		// Create the gallery.
		await page.click( wpMediaAddButtonSelector );

		// Could take time to create the gallery.
		await page.waitForSelector( 'li[tabindex="0"]' );

		// Insert the gallery.
		await page.click( 'text=Insert gallery', { delay: 500, clickCount: 2 } );

		const galleryItems = editor.getPreviewFrame().locator( '.elementor-image-gallery figure.gallery-item' );

		// Check that a gallery with two images has been added to the page.
		await expect( galleryItems ).toHaveCount( 2 );

		// Open the gallery's slideshow in a lightbox.
		await galleryItems.first().click();

		const slideshowLightboxImage = editor.getPreviewFrame().locator( 'img[alt="mountain-image"].elementor-lightbox-image, img[alt="field-image"].elementor-lightbox-image' );

		// Test that the lightbox appeared.
		await expect( slideshowLightboxImage.first() ).toBeVisible();

		await editor.publishAndViewPage();

		/**
		 * Get the action hash from the image, go to the page URL with the hash and check that the lightbox is triggered.
		 */
		const frontendMountainImageElement = page.locator( '.elementor-widget-image a' ).nth( 0 );

		await frontendMountainImageElement.waitFor( { state: 'visible' } );

		const mountainImageHash = await frontendMountainImageElement.getAttribute( 'data-e-action-hash' );

		const pageURL = page.url();

		// Go to the front end of the test page with the action hash.
		await page.goto( pageURL + mountainImageHash );

		// Reload so the hash will be parsed.
		await page.reload();

		await page.waitForSelector( '.elementor-lightbox-image' );

		const frontendSinglelightboxImage = page.locator( '.elementor-lightbox-image' );

		// Test that the lightbox was successfully loaded.
		await expect( frontendSinglelightboxImage ).toBeVisible();

		/**
		 * Test that a bad hash doesn't run
		 *
		 * In this test, I replace the 'settings' array of the mountainImageHash with a settings array that triggers an
		 * `alert()`. We check that the lightbox IS NOT visible.
		 */
		const settingsJson = '{"id":1,"url":"https://elementor.com/", "onClick": "alert()"}';

		const testActionHash = '#' + encodeURIComponent( 'elementor-action:action=lightbox&settings=' + Buffer.from( settingsJson ).toString( 'base64' ) );

		// Go to the front end of the test page with the action hash.
		await page.goto( pageURL + testActionHash );

		// Reload so the hash will be parsed.
		await page.reload();
		// Test that the lightbox was NOT OPENED on this page.
		await expect( frontendSinglelightboxImage ).not.toBeVisible();
	} );
} );
