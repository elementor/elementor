export const THIN_ELEMENT_MAX_HEIGHT_PX = 1;

export const SMALLER_OUTLINE_OFFSET_WIDGET_TYPES = new Set( [ 'e-form-input' ] );

export function shouldUseSmallerOutlineOffset( element: HTMLElement, widgetType?: string ): boolean {
	if ( element.offsetHeight <= THIN_ELEMENT_MAX_HEIGHT_PX ) {
		return true;
	}

	return widgetType !== undefined && SMALLER_OUTLINE_OFFSET_WIDGET_TYPES.has( widgetType );
}
