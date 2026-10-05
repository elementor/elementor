const DECORATIVE_PLACEHOLDER_MIN_SIZE = '0';

export function applyDecorativePlaceholder(
	element: HTMLElement | undefined,
	editorSettings: Record< string, unknown > | null | undefined
): void {
	const emptyView = Array.from( element?.children ?? [] ).find( ( child ) =>
		child.classList.contains( 'elementor-empty-view' )
	);

	if ( ! ( emptyView instanceof HTMLElement ) ) {
		return;
	}

	const size = true === editorSettings?.decorative ? DECORATIVE_PLACEHOLDER_MIN_SIZE : '';

	emptyView.style.minHeight = size;
	emptyView.style.minWidth = size;
}
