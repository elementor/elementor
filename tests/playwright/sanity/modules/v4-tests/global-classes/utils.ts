import { Page, type APIRequestContext } from '@playwright/test';
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
	} catch ( error ) {
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
	const toast = page.locator( '#elementor-toast' );
	await toast.waitFor( { state: 'hidden', timeout: 10000 } ).catch( () => {} );

	const saveButton = page.getByRole( 'button', { name: 'Save changes' } );

	if ( await saveButton.isEnabled( { timeout: 5000 } ).catch( () => false ) ) {
		await saveButton.click( { force: true } );
		await saveButton.waitFor( { state: 'hidden', timeout: timeouts.expect } ).catch( () => {} );
	}

	await page.getByRole( 'button', { name: 'Close' } ).click();
	await page.waitForTimeout( 500 );
}

export async function deleteClassFromClassManager( page: Page, className: string ): Promise<void> {
	const classItem = page.locator( 'li[role="listitem"]' ).filter( { hasText: className } );
	await classItem.hover();
	await classItem.locator( '[aria-label="More actions"]' ).click();
	await page.getByRole( 'menuitem', { name: 'Delete' } ).click();
	await page.getByRole( 'button', { name: 'Delete' } ).click();
}

export async function startSyncToV3( page: Page, className: string ): Promise<void> {
	const classItem = page.locator( 'li[role="listitem"]' ).filter( { hasText: className } );
	await classItem.hover();
	await classItem.locator( 'button[aria-label="More actions"]' ).click();

	await page.getByRole( 'menuitem' ).filter( { hasText: 'Sync to Global Fonts' } ).click();
	await page.getByRole( 'button', { name: 'Sync to Global Fonts' } ).click();
}

export async function saveAndCloseClassManagerViaDialog( page: Page ): Promise<void> {
	await page.getByRole( 'button', { name: 'Close' } ).click();
	await page.getByRole( 'dialog', { name: 'You have unsaved changes' } ).getByRole( 'button', { name: 'Save & Continue' } ).click();
}

export async function reorderClassInClassManager(
	page: Page,
	sourceClassName: string,
	targetClassName: string,
): Promise<void> {
	const listItems = page.locator( 'li[role="listitem"]' );

	const sourceItem = listItems.filter( { hasText: sourceClassName } );
	const targetItem = listItems.filter( { hasText: targetClassName } );

	const sourceDragHandle = sourceItem.getByRole( 'button', { name: 'sort', exact: true } );

	await sourceItem.hover();
	await sourceDragHandle.dragTo( targetItem );
}
