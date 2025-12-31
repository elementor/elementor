import { __privateRunCommand as runCommand } from '@elementor/editor-v1-adapters';

export function switchToComponent(
	componentId: number | string,
	componentInstanceId?: string | null,
	element?: HTMLElement | null
) {
	const selector = getSelector( element, componentInstanceId );

	runCommand( 'editor/documents/switch', {
		id: componentId,
		selector,
		mode: 'autosave',
		setAsInitial: false,
		shouldScroll: false,
	} );
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
	let current: HTMLElement | null = element.closest( '[data-id]' ) as HTMLElement | null;

	while ( current ) {
		const dataId = current.dataset.id;
		const isComponentInstance = current.hasAttribute( 'data-elementor-id' );

		if ( isComponentInstance ) {
			selectors.unshift( `[data-id="${ dataId }"]` );
		}

		current = current.parentElement?.closest( '[data-id]' ) as HTMLElement | null;
	}

	if ( selectors.length === 0 ) {
		const closestElement = element.closest( '[data-id]' ) as HTMLElement | null;

		if ( closestElement?.dataset?.id ) {
			return `[data-id="${ closestElement.dataset.id }"]`;
		}
	}

	return selectors.join( ' ' );
}
