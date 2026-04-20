import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../parallelTest';
import WpAdminPage from '../../../pages/wp-admin-page';
import { wpCli } from '../../../assets/wp-cli';

test.describe( 'Twig Containers Editor Rendering @twig-containers', () => {
	const divBlockType = 'e-div-block';
	const flexboxType = 'e-flexbox';

	test.beforeAll( async () => {
		await wpCli( 'wp elementor experiments activate e_atomic_elements' );
		await wpCli( 'wp elementor experiments activate e_twig_containers' );
	} );

	test.afterAll( async ( { browser, apiRequests }, testInfo ) => {
		const context = await browser.newContext();
		const page = await context.newPage();
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		await wpAdmin.resetExperiments();
		await page.close();
	} );

	test( 'Div block renders with correct attributes in editor', async ( { page, apiRequests }, testInfo ) => {
		// Arrange
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = await wpAdmin.openNewPage();
		const elementId = await editor.addElement( { elType: divBlockType }, 'document' );
		const element = editor.getPreviewFrame().locator( `[data-id="${ elementId }"]` );

		// Assert
		await expect( element ).toBeVisible();
		await expect( element ).toHaveAttribute( 'data-id', elementId );
		await expect( element ).toHaveAttribute( 'data-element_type', divBlockType );
		await expect( element ).toHaveAttribute( 'data-e-type', divBlockType );

		const tagName = await element.evaluate( ( el ) => el.tagName.toLowerCase() );
		expect( tagName ).toBe( 'div' );
	} );

	test( 'Flexbox renders with correct attributes in editor', async ( { page, apiRequests }, testInfo ) => {
		// Arrange
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = await wpAdmin.openNewPage();
		const elementId = await editor.addElement( { elType: flexboxType }, 'document' );
		const element = editor.getPreviewFrame().locator( `[data-id="${ elementId }"]` );

		// Assert
		await expect( element ).toBeVisible();
		await expect( element ).toHaveAttribute( 'data-id', elementId );
		await expect( element ).toHaveAttribute( 'data-element_type', flexboxType );
		await expect( element ).toHaveAttribute( 'data-e-type', flexboxType );

		const tagName = await element.evaluate( ( el ) => el.tagName.toLowerCase() );
		expect( tagName ).toBe( 'div' );
	} );

	test( 'Changing tag setting updates DOM element tag for div-block', async ( { page, apiRequests }, testInfo ) => {
		// Arrange
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = await wpAdmin.openNewPage();
		const elementId = await editor.addElement( { elType: divBlockType }, 'document' );
		const elementLocator = () => editor.getPreviewFrame().locator( `[data-id="${ elementId }"]` );

		await expect( elementLocator() ).toBeVisible();

		// Act
		await editor.applyElementSettings( elementId, {
			tag: { $$type: 'string', value: 'article' },
		} );

		// Assert
		await expect.poll( async () => {
			return await elementLocator().evaluate( ( el ) => el.tagName.toLowerCase() );
		} ).toBe( 'article' );

		await expect( elementLocator() ).toHaveAttribute( 'data-id', elementId );
	} );

	test( 'Changing tag setting updates DOM element tag for flexbox', async ( { page, apiRequests }, testInfo ) => {
		// Arrange
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = await wpAdmin.openNewPage();
		const elementId = await editor.addElement( { elType: flexboxType }, 'document' );
		const elementLocator = () => editor.getPreviewFrame().locator( `[data-id="${ elementId }"]` );

		await expect( elementLocator() ).toBeVisible();

		// Act
		await editor.applyElementSettings( elementId, {
			tag: { $$type: 'string', value: 'section' },
		} );

		// Assert
		await expect.poll( async () => {
			return await elementLocator().evaluate( ( el ) => el.tagName.toLowerCase() );
		} ).toBe( 'section' );

		await expect( elementLocator() ).toHaveAttribute( 'data-id', elementId );
	} );

	test( 'Adding a link changes tag to anchor for div-block', async ( { page, apiRequests }, testInfo ) => {
		// Arrange
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = await wpAdmin.openNewPage();
		const elementId = await editor.addElement( { elType: divBlockType }, 'document' );
		const elementLocator = () => editor.getPreviewFrame().locator( `[data-id="${ elementId }"]` );

		await expect( elementLocator() ).toBeVisible();

		// Act
		await editor.applyElementSettings( elementId, {
			link: {
				$$type: 'link',
				value: {
					destination: {
						$$type: 'url',
						value: 'https://example.com',
					},
				},
			},
		} );

		// Assert
		await expect.poll( async () => {
			return await elementLocator().evaluate( ( el ) => el.tagName.toLowerCase() );
		} ).toBe( 'a' );

		await expect( elementLocator() ).toHaveAttribute( 'href', 'https://example.com' );
		await expect( elementLocator() ).toHaveAttribute( 'data-id', elementId );
	} );

	test( 'Nested div-block renders correctly', async ( { page, apiRequests }, testInfo ) => {
		// Arrange
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = await wpAdmin.openNewPage();
		const parentId = await editor.addElement( { elType: divBlockType }, 'document' );
		const childId = await editor.addElement( { elType: divBlockType }, parentId );

		const parent = editor.getPreviewFrame().locator( `[data-id="${ parentId }"]` );
		const child = editor.getPreviewFrame().locator( `[data-id="${ childId }"]` );

		// Assert
		await expect( parent ).toBeVisible();
		await expect( child ).toBeVisible();
		await expect( parent ).toHaveAttribute( 'data-element_type', divBlockType );
		await expect( child ).toHaveAttribute( 'data-element_type', divBlockType );

		const childParentDataId = await child.evaluate( ( el ) => {
			return el.parentElement?.closest( '[data-element_type]' )?.getAttribute( 'data-id' );
		} );

		expect( childParentDataId ).toBe( parentId );
	} );

	test( 'CSS ID setting applies id attribute', async ( { page, apiRequests }, testInfo ) => {
		// Arrange
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = await wpAdmin.openNewPage();
		const elementId = await editor.addElement( { elType: flexboxType }, 'document' );
		const element = editor.getPreviewFrame().locator( `[data-id="${ elementId }"]` );

		await expect( element ).toBeVisible();

		// Act
		await editor.applyElementSettings( elementId, {
			_cssid: { $$type: 'string', value: 'my-custom-id' },
		} );

		// Assert
		await expect.poll( async () => {
			return await element.getAttribute( 'id' );
		} ).toBe( 'my-custom-id' );
	} );
} );
