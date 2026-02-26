import { Page, type APIRequestContext } from '@playwright/test';
import type ApiRequests from '../../../../assets/api-requests';
import EditorPage from '../../../../pages/editor-page';

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
};

export async function getGlobalClasses( apiRequests: ApiRequests, request: APIRequestContext ): Promise<{ items: Record<string, GlobalClassItem>; order: string[] }> {
	try {
		const data = await apiRequests.customGet( request, 'index.php?rest_route=/elementor/v1/global-classes' );
		return {
			items: data.data || {},
			order: data.meta?.order || [],
		};
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

		createGlobalClasses( apiRequests, request, {}, [] );

		return { success: true, deleted: order.length };
	} catch ( error ) {
		return { success: false, deleted: 0 };
	}
}

export async function createGlobalClasses(
	apiRequests: ApiRequests,
	request: APIRequestContext,
	items: Record<string, GlobalClassItem>,
	order: string[],
): Promise<{ ok: boolean; error?: string }> {
	try {
		await apiRequests.customPut( request, 'index.php?rest_route=/elementor/v1/global-classes', {
			items,
			order,
			changes: { added: order, deleted: [], modified: [] },
		} );
		return { ok: true };
	} catch ( error ) {
		return { ok: false, error: String( error ) };
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

	const gotItButton = page.locator( '[aria-label="Got it introduction"]' );
	if ( await gotItButton.isVisible( { timeout: 2000 } ).catch( () => false ) ) {
		await gotItButton.click();
	}
}

export async function saveAndCloseClassManager( page: Page ): Promise<void> {
	const toast = page.locator( '#elementor-toast' );
	await toast.waitFor( { state: 'hidden', timeout: 10000 } ).catch( () => {} );

	const saveButton = page.getByRole( 'button', { name: 'Save changes' } );

	if ( await saveButton.isEnabled( { timeout: 5000 } ).catch( () => false ) ) {
		await saveButton.click( { force: true } );
		// Await saveButton.waitFor( { state: 'disabled', timeout: 10000 } ).catch( () => {} );
	}

	await page.getByRole( 'button', { name: 'Close' } ).click();
	await page.waitForTimeout( 500 );
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
