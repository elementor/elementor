import { expect, type Frame } from '@playwright/test';
import { parallelTest as test } from '../../../parallelTest';
import WpAdminPage from '../../../pages/wp-admin-page';
import EditorPage from '../../../pages/editor-page';

const INNER_CONTAINER_HANDLE_BACKGROUND = 'rgb(157, 165, 174)';
const PARENT_CONTAINER_HANDLE_BACKGROUND = 'rgb(243, 186, 253)';
const PARENT_CONTAINER_OUTLINE_COLOR = PARENT_CONTAINER_HANDLE_BACKGROUND;

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
			await expectParentContainerOutline( editor.getPreviewFrame(), containerId );
		} );

		await test.step( 'Embedded document top container flips handles inside below parent document handle', async () => {
			// Arrange.
			const containerId = await editor.addElement( { elType: 'container' }, 'document' );
			await wrapContainerInEmbeddedDocumentWithTopHandle( editor, containerId );

			// Act.
			await hoverContainer( editor, containerId );

			// Assert.
			await expectContainerHandlesInside( editor.getPreviewFrame(), containerId );
		} );

		await test.step( 'Top-level parent below embedded document keeps outside handles', async () => {
			// Arrange.
			const embeddedContainerId = await editor.addElement( { elType: 'container' }, 'document' );
			await wrapContainerInEmbeddedDocumentWithTopHandle( editor, embeddedContainerId );
			const topLevelContainerId = await editor.addElement( { elType: 'container' }, 'document' );

			// Act.
			await hoverContainer( editor, topLevelContainerId );

			// Assert.
			await expect( editor.getPreviewFrame().locator( getContainerSelector( topLevelContainerId ) ) ).not.toHaveClass( /e-handles-inside/ );
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

async function expectParentContainerOutline( frame: Frame, containerId: string ) {
	const outline = await frame.locator( getContainerSelector( containerId ) ).evaluate( ( element ) => {
		const overlay = element.querySelector( ':scope > .elementor-element-overlay' );

		if ( ! overlay ) {
			return null;
		}

		const outlineStyle = getComputedStyle( overlay, ':after' );

		return {
			color: outlineStyle.outlineColor,
			style: outlineStyle.outlineStyle,
		};
	} );

	expect( outline ).toEqual( {
		color: PARENT_CONTAINER_OUTLINE_COLOR,
		style: 'solid',
	} );
}

async function expectContainerHandlesInside( frame: Frame, containerId: string ) {
	const container = frame.locator( getContainerSelector( containerId ) );
	const settings = container.locator( '> .elementor-element-overlay > .elementor-editor-element-settings' );

	await expect( container ).toHaveClass( /e-handles-inside/ );

	const containerBox = await container.boundingBox();
	const settingsBox = await settings.boundingBox();

	if ( ! containerBox || ! settingsBox ) {
		throw new Error( 'Container or handle bounds were not available.' );
	}

	expect( settingsBox.y ).toBeGreaterThanOrEqual( containerBox.y );
}

async function wrapContainerInPostContentDocument( editor: EditorPage, containerId: string ) {
	await editor.getPreviewFrame().evaluate( ( id ) => {
		const container = document.querySelector( `.elementor-element-${ id }` );

		if ( ! container?.parentElement ) {
			throw new Error( 'Container was not found for nested document simulation.' );
		}

		const postContentWidget = document.createElement( 'div' );
		postContentWidget.className = 'elementor-widget elementor-widget-theme-post-content';

		const boxedContainer = document.createElement( 'div' );
		boxedContainer.className = 'e-con e-con-boxed elementor-element';

		const boxedInner = document.createElement( 'div' );
		boxedInner.className = 'e-con-inner';

		const nestedDocument = document.createElement( 'div' );
		nestedDocument.className = 'elementor elementor-edit-mode elementor-edit-area elementor-edit-area-active';
		nestedDocument.dataset.elementorId = '999';
		nestedDocument.dataset.elementorType = 'wp-post';

		container.parentElement.insertBefore( postContentWidget, container );
		postContentWidget.appendChild( boxedContainer );
		boxedContainer.appendChild( boxedInner );
		boxedInner.appendChild( nestedDocument );
		nestedDocument.appendChild( container );
	}, containerId );
}

async function wrapContainerInEmbeddedDocumentWithTopHandle( editor: EditorPage, containerId: string ) {
	await editor.getPreviewFrame().evaluate( ( id ) => {
		const container = document.querySelector( `.elementor-element-${ id }` );

		if ( ! container?.parentElement ) {
			throw new Error( 'Container was not found for embedded document simulation.' );
		}

		const hostDocument = container.closest( '.elementor-edit-area-active' );

		if ( ! hostDocument ) {
			throw new Error( 'Active host document was not found for embedded document simulation.' );
		}

		hostDocument.classList.remove( 'elementor-edit-area-active' );
		hostDocument.classList.add( 'elementor-embedded-editor' );

		const parentWidget = document.createElement( 'div' );
		parentWidget.className = 'elementor-widget elementor-widget-theme-post-content';
		parentWidget.style.marginTop = '200px';

		const parentOverlay = document.createElement( 'div' );
		parentOverlay.className = 'elementor-element-overlay';

		const parentSettings = document.createElement( 'ul' );
		parentSettings.className = 'elementor-editor-element-settings elementor-editor-widget-settings elementor-editor-element-overlay-settings';
		parentSettings.style.position = 'absolute';
		parentSettings.style.top = '0';
		parentSettings.style.zIndex = '9999';

		const parentHandle = document.createElement( 'li' );
		parentHandle.className = 'elementor-editor-element-setting elementor-editor-element-edit';
		parentSettings.appendChild( parentHandle );
		parentOverlay.appendChild( parentSettings );

		const nestedDocument = document.createElement( 'div' );
		nestedDocument.className = 'elementor elementor-edit-mode elementor-edit-area elementor-edit-area-active';
		nestedDocument.dataset.elementorId = '999';
		nestedDocument.dataset.elementorType = 'wp-post';

		container.parentElement.insertBefore( parentWidget, container );
		parentWidget.appendChild( parentOverlay );
		parentWidget.appendChild( nestedDocument );
		nestedDocument.appendChild( container );
	}, containerId );
}
