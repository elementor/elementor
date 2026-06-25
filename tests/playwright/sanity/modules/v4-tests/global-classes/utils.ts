import { expect, Page, type APIRequestContext } from '@playwright/test';
import type ApiRequests from '../../../../assets/api-requests';
import EditorPage from '../../../../pages/editor-page';
import { timeouts } from '../../../../config/timeouts';

type GlobalClassVariant = {
	meta: { breakpoint: string | null; state: string | null };
	props: Record<string, unknown>;
	custom_css: null;
};

type GlobalClassItem = {
	id: string;
	type: 'class';
	label: string;
	variants: GlobalClassVariant[];
	sync_to_v3?: boolean;
};

export async function getGlobalClasses( apiRequests: ApiRequests, request: APIRequestContext ): Promise<{ items: Record<string, Pick<GlobalClassItem, 'id' | 'label'>>; order: string[] }> {
	try {
		const response = await apiRequests.customGet( request, 'index.php?rest_route=/elementor/v1/global-classes' );

		const list: Array<{ id: string; label: string }> = Array.isArray( response?.data )
			? response.data
			: [];

		const items: Record<string, Pick<GlobalClassItem, 'id' | 'label'>> = {};
		const order: string[] = [];

		for ( const entry of list ) {
			if ( ! entry?.id ) {
				continue;
			}

			items[ entry.id ] = { id: entry.id, label: entry.label };
			order.push( entry.id );
		}

		return { items, order };
	} catch {
		return { items: {}, order: [] };
	}
}

export async function deleteAllGlobalClasses( apiRequests: ApiRequests, request: APIRequestContext ): Promise<{ success: boolean; deleted: number }> {
	try {
		const { order } = await getGlobalClasses( apiRequests, request );

		if ( 0 === order.length ) {
			return { success: true, deleted: 0 };
		}

		await apiRequests.customPut( request, 'index.php?rest_route=/elementor/v1/global-classes', {
			items: {},
			order: [],
			changes: { added: [], deleted: order, modified: [], order: false },
		} );

		return { success: true, deleted: order.length };
	} catch {
		return { success: false, deleted: 0 };
	}
}

const CREATE_BATCH_SIZE = 100;

export async function createGlobalClasses(
	apiRequests: ApiRequests,
	request: APIRequestContext,
	items: Record<string, GlobalClassItem>,
	order: string[],
): Promise<{ success: boolean; error?: string }> {
	try {
		const totalBatches = Math.ceil( order.length / CREATE_BATCH_SIZE );

		for ( let i = 0; i < order.length; i += CREATE_BATCH_SIZE ) {
			const batchIds = order.slice( i, i + CREATE_BATCH_SIZE );
			const batchItems: Record<string, GlobalClassItem> = {};

			for ( const id of batchIds ) {
				batchItems[ id ] = items[ id ];
			}

			const cumulativeOrder = order.slice( 0, i + batchIds.length );
			const batchNumber = Math.floor( i / CREATE_BATCH_SIZE ) + 1;

			// eslint-disable-next-line no-console
			console.log( `[createGlobalClasses] Batch ${ batchNumber }/${ totalBatches } (${ batchIds.length } classes)` );

			await apiRequests.customPut( request, 'index.php?rest_route=/elementor/v1/global-classes', {
				items: batchItems,
				order: cumulativeOrder,
				changes: { added: batchIds, deleted: [], modified: [], order: false },
			} );
		}

		return { success: true };
	} catch ( error ) {
		return { success: false, error: String( error ) };
	}
}

export async function publishAndWaitForClassesSave( editor: EditorPage, page: Page ): Promise< void > {
	const [ response ] = await Promise.all( [
		page.waitForResponse(
			( res ) => res.url().includes( 'global-classes' ) && 'PUT' === res.request().method(),
			{ timeout: timeouts.longAction },
		),
		editor.publishPage(),
	] );

	if ( ! response.ok() ) {
		throw new Error( `Global classes save failed: ${ response.status() } ${ await response.text() }` );
	}
}

export async function openClassManager( page: Page, editor: EditorPage, divBlockId: string ): Promise<void> {
	await editor.selectElement( divBlockId );
	await editor.v4Panel.openTab( 'style' );

	await page.getByRole( 'button', { name: 'Class Manager' } ).click();

	const saveAndContinueButton = page.getByRole( 'button', { name: 'Save & Continue' } );
	if ( await saveAndContinueButton.isVisible( { timeout: 2000 } ).catch( () => false ) ) {
		await saveAndContinueButton.click();
	}

	await dismissClassManagerIntro( page );
}

export async function dismissClassManagerIntro( page: Page ): Promise<void> {
	const introDialog = page.getByRole( 'dialog' ).filter( { hasText: "Don't show this again" } );
	const gotItButton = introDialog.getByRole( 'button', { name: 'Got it introduction' } );

	await gotItButton.click( { timeout: 2000, force: true } ).catch( () => {} );
}

export async function saveAndCloseClassManager( page: Page ): Promise<void> {
	const deleteDialog = page.getByRole( 'dialog', { name: 'Delete this class?' } );
	if ( await deleteDialog.isVisible().catch( () => false ) ) {
		throw new Error( 'Delete confirmation dialog is still open — confirm deletion before saving.' );
	}

	const saveButton = page.getByRole( 'button', { name: 'Save changes' } );

	if ( await saveButton.isEnabled( { timeout: 5000 } ).catch( () => false ) ) {
		const [ response ] = await Promise.all( [
			page.waitForResponse(
				( res ) => res.url().includes( 'global-classes' ) && 'PUT' === res.request().method(),
				{ timeout: timeouts.longAction },
			),
			saveButton.click(),
		] );

		if ( ! response.ok() ) {
			throw new Error( `Global classes save failed: ${ response.status() } ${ await response.text() }` );
		}

		await expect( saveButton ).toBeDisabled( { timeout: timeouts.expect } );
	}

	await page.getByRole( 'button', { name: 'Close' } ).click();

	const unsavedDialog = page.getByRole( 'dialog', { name: 'You have unsaved changes' } );
	if ( await unsavedDialog.isVisible( { timeout: 2000 } ).catch( () => false ) ) {
		const [ response ] = await Promise.all( [
			page.waitForResponse(
				( res ) => res.url().includes( 'global-classes' ) && 'PUT' === res.request().method(),
				{ timeout: timeouts.longAction },
			),
			unsavedDialog.getByRole( 'button', { name: 'Save & Continue' } ).click(),
		] );

		if ( ! response.ok() ) {
			throw new Error( `Global classes save failed: ${ response.status() } ${ await response.text() }` );
		}
	}
}

export async function deleteClassFromClassManager( page: Page, className: string ): Promise<void> {
	const classItem = classManagerListItem( page, className );
	await classItem.scrollIntoViewIfNeeded();
	await classItem.hover();
	await classItem.locator( '[aria-label="More actions"]' ).click();
	await page.getByRole( 'menuitem', { name: 'Delete' } ).click();

	const deleteDialog = page.getByRole( 'dialog', { name: 'Delete this class?' } );
	await expect( deleteDialog ).toBeVisible( { timeout: timeouts.expect } );
	await deleteDialog.getByRole( 'button', { name: 'Delete' } ).click();
	await expect( deleteDialog ).toBeHidden( { timeout: timeouts.expect } );
	await expect( classItem ).toBeHidden( { timeout: timeouts.expect } );
}

export async function startSyncToV3( page: Page, className: string ): Promise<void> {
	const classItem = classManagerListItem( page, className );
	await classItem.hover();
	await classItem.locator( 'button[aria-label="More actions"]' ).click();

	await page.getByRole( 'menuitem' ).filter( { hasText: 'Sync to Global Fonts' } ).click();
	await page.getByRole( 'button', { name: 'Sync to Global Fonts' } ).click();
}

export async function saveAndCloseClassManagerViaDialog( page: Page ): Promise<void> {
	await page.getByRole( 'button', { name: 'Close' } ).click();
	await page.getByRole( 'dialog', { name: 'You have unsaved changes' } ).getByRole( 'button', { name: 'Save & Continue' } ).click();
}

function classManagerListItem( page: Page, className: string ) {
	return page
		.locator( 'li[role="listitem"]' )
		.filter( { has: page.getByText( className, { exact: true } ) } );
}

export async function reorderClassInClassManager(
	page: Page,
	sourceClassName: string,
	targetClassName: string,
): Promise<void> {
	const sourceItem = classManagerListItem( page, sourceClassName );
	const targetItem = classManagerListItem( page, targetClassName );
	const sourceDragHandle = sourceItem.locator( '.class-item-sortable-trigger' );

	await expect( sourceItem ).toBeVisible( { timeout: timeouts.expect } );
	await expect( targetItem ).toBeVisible( { timeout: timeouts.expect } );

	await sourceItem.scrollIntoViewIfNeeded();
	await targetItem.scrollIntoViewIfNeeded();

	await sourceItem.hover();
	await expect( sourceDragHandle ).toBeVisible( { timeout: timeouts.expect } );
	await sourceDragHandle.dragTo( targetItem );

	await expect( page.getByRole( 'button', { name: 'Save changes' } ) ).toBeEnabled( { timeout: timeouts.expect } );
}
