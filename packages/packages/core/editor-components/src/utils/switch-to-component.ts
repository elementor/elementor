import { invalidateDocumentData, switchToDocument } from '@elementor/editor-documents';
import { getCurrentDocumentContainer, selectElement } from '@elementor/editor-elements';
import { __privateRunCommand as runCommand } from '@elementor/editor-v1-adapters';

export async function switchToComponent(
	componentId: number,
	componentInstanceId?: string | null,
	element?: HTMLElement | null
) {
	const selector = getSelector( element, componentInstanceId );

	invalidateDocumentData( componentId );

	await switchToDocument( componentId, {
		selector,
		mode: 'autosave',
		setAsInitial: false,
		shouldScroll: false,
	} );

	const currentDocumentContainer = getCurrentDocumentContainer();
	const topLevelElement = currentDocumentContainer?.children?.[ 0 ];

	if ( topLevelElement ) {
		selectElement( topLevelElement.id );
		expandNavigator();
	}
}

export async function expandNavigator() {
	await runCommand( 'navigator/expand-all' );
}

function getSelector( element?: HTMLElement | null, componentInstanceId?: string | null ): string | undefined {
	if ( element ) {
		return buildUniqueSelector( element );
	}

	if ( componentInstanceId ) {
		return `[data-id="${ componentInstanceId }"]`;
	}

	return undefined;
}

export function buildUniqueSelector( element: HTMLElement ): string {
	const selectors: string[] = [];
	let current = element.closest< HTMLElement >( '[data-id]' );

	while ( current ) {
		const dataId = current.dataset.id;
		const isComponentInstance = current.hasAttribute( 'data-elementor-id' );

		if ( isComponentInstance ) {
			selectors.unshift( `[data-id="${ dataId }"]` );
		}

		current = current.parentElement?.closest( '[data-id]' ) ?? null;
	}

	if ( selectors.length === 0 ) {
		const closestElement = element.closest< HTMLElement >( '[data-id]' );

		if ( closestElement?.dataset?.id ) {
			return `[data-id="${ closestElement.dataset.id }"]`;
		}
	}

	return selectors.join( ' ' );
}
