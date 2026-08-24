import { expect, type Frame } from '@playwright/test';
import { parallelTest as test } from '../../../parallelTest';
import WpAdminPage from '../../../pages/wp-admin-page';
import EditorPage from '../../../pages/editor-page';

const INNER_CONTAINER_HANDLE_BACKGROUND = 'rgb(157, 165, 174)';
const PARENT_CONTAINER_HANDLE_BACKGROUND = 'rgb(243, 186, 253)';

test.describe( 'Container handles @container', () => {
	test( 'Inner handle styles stay scoped to nested containers [ED-25335]', async ( { page, apiRequests }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = await wpAdmin.openNewPage();

		await editor.closeNavigatorIfOpen();
		await editor.setPageTemplate( 'canvas' );

		await test.step( 'Top-level parent container keeps outer handle styling', async () => {
			// Act.
			const containerId = await editor.addElement( { elType: 'container' }, 'document' );
			await hoverContainer( editor, containerId );

			// Assert.
			await expectParentContainerHandle( editor.getPreviewFrame(), containerId );
		} );

		await test.step( 'Direct child container keeps inner handle styling', async () => {
			// Arrange.
			const parentId = await editor.addElement( { elType: 'container' }, 'document' );
			const childId = await editor.addElement( { elType: 'container' }, parentId );

			// Act.
			await hoverContainer( editor, childId );

			// Assert.
			await expectInnerContainerHandle( editor.getPreviewFrame(), childId );
		} );

		await test.step( 'Boxed child container keeps inner handle styling', async () => {
			// Arrange.
			const parentId = await editor.addElement( { elType: 'container' }, 'document' );
			await editor.setSelectControlValue( 'content_width', 'boxed' );
			const childId = await editor.addElement( { elType: 'container' }, parentId );

			// Act.
			await hoverContainer( editor, childId );

			// Assert.
			await expectInnerContainerHandle( editor.getPreviewFrame(), childId );
		} );

		await test.step( 'Widget-contained child container keeps inner handle styling', async () => {
			// Arrange.
			const parentId = await editor.addElement( { elType: 'container' }, 'document' );
			await editor.addWidget( { widgetType: 'nested-tabs', container: parentId } );
			const widgetChild = editor.getPreviewFrame().locator( '.elementor-widget-n-tabs .e-n-tabs-content > .e-con' ).first();
			const childId = await widgetChild.getAttribute( 'data-id' );

			if ( ! childId ) {
				throw new Error( 'Nested tabs child container was not found.' );
			}

			// Act.
			await hoverContainer( editor, childId );

			// Assert.
			await expectInnerContainerHandle( editor.getPreviewFrame(), childId );
		} );

		await test.step( 'Nested-document parent under a widget keeps outer handle styling', async () => {
			// Arrange.
			const containerId = await editor.addElement( { elType: 'container' }, 'document' );
			await wrapContainerInPostContentDocument( editor, containerId );

			// Act.
			await hoverContainer( editor, containerId );

			// Assert.
			await expectParentContainerHandle( editor.getPreviewFrame(), containerId );
		} );

		await editor.setPageTemplate( 'default' );
	} );
} );

function getContainerSelector( containerId: string ) {
	return `.elementor-edit-mode .elementor-element-${ containerId }`;
}

async function hoverContainer( editor: EditorPage, containerId: string ) {
	await editor.getPreviewFrame().hover( getContainerSelector( containerId ) );
}

async function expectInnerContainerHandle( frame: Frame, containerId: string ) {
	const container = frame.locator( getContainerSelector( containerId ) );
	const settings = container.locator( '> .elementor-element-overlay > .elementor-editor-element-settings' );

	await expect( container ).toHaveClass( /e-child/ );
	await expect( settings.locator( '> .elementor-editor-element-edit' ) ).toHaveCSS( 'background-color', INNER_CONTAINER_HANDLE_BACKGROUND );
	await expect( settings.locator( '> .elementor-editor-element-add' ) ).toBeHidden();
}

async function expectParentContainerHandle( frame: Frame, containerId: string ) {
	const container = frame.locator( getContainerSelector( containerId ) );
	const settings = container.locator( '> .elementor-element-overlay > .elementor-editor-element-settings' );

	await expect( container ).toHaveClass( /e-parent/ );
	await expect( settings ).toHaveCSS( 'background-color', PARENT_CONTAINER_HANDLE_BACKGROUND );
	await expect( settings.locator( '> .elementor-editor-element-edit' ) ).not.toHaveCSS( 'background-color', INNER_CONTAINER_HANDLE_BACKGROUND );
	await expect( settings.locator( '> .elementor-editor-element-add' ) ).toBeVisible();
}

async function wrapContainerInPostContentDocument( editor: EditorPage, containerId: string ) {
	await editor.getPreviewFrame().evaluate( ( id ) => {
		const container = document.querySelector( `.elementor-element-${ id }` );

		if ( ! container?.parentElement ) {
			throw new Error( 'Container was not found for nested document simulation.' );
		}

		const postContentWidget = document.createElement( 'div' );
		postContentWidget.className = 'elementor-widget elementor-widget-theme-post-content';

		const nestedDocument = document.createElement( 'div' );
		nestedDocument.className = 'elementor elementor-edit-mode';
		nestedDocument.dataset.elementorId = '999';
		nestedDocument.dataset.elementorType = 'wp-post';

		container.parentElement.insertBefore( postContentWidget, container );
		postContentWidget.appendChild( nestedDocument );
		nestedDocument.appendChild( container );
	}, containerId );
}
