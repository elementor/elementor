export type IconLibraryAnchor = {
	top: number;
	left: number;
	width: number;
};

type AnchorRect = Pick< DOMRect, 'top' | 'left' | 'width' >;

export function getIconLibraryAnchor(
	containerRect: AnchorRect | null | undefined,
	buttonGroupRect: Pick< DOMRect, 'top' > | null | undefined
): IconLibraryAnchor | null {
	if ( ! containerRect || containerRect.width <= 0 ) {
		return null;
	}

	return {
		top: buttonGroupRect?.top ?? containerRect.top,
		left: containerRect.left,
		width: containerRect.width,
	};
}
