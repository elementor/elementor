const TOOLBAR_SELECTOR = ':scope > .elementor-element-overlay > .elementor-editor-element-settings';
const WING_OVERHANG = 14;
const OUTLINE_OVERHANG = 3;

export type ToolbarCutoutRect = { x: number; y: number; width: number; height: number };

export function useToolbarRect( element: HTMLElement | null, rect: DOMRect ): ToolbarCutoutRect | null {
	if ( ! element ) {
		return null;
	}

	const toolbar = element.querySelector( TOOLBAR_SELECTOR );

	if ( ! toolbar ) {
		return null;
	}

	const toolbarRect = toolbar.getBoundingClientRect();

	if ( toolbarRect.width === 0 && toolbarRect.height === 0 ) {
		return null;
	}

	return {
		x: toolbarRect.left - rect.left - WING_OVERHANG,
		y: toolbarRect.top - rect.top - OUTLINE_OVERHANG,
		width: toolbarRect.width + WING_OVERHANG * 2,
		height: toolbarRect.height + OUTLINE_OVERHANG * 2,
	};
}
