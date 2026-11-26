let dragging = false;

export function isPanelDragging() {
	return dragging;
}

export function setPanelDragging( value: boolean ) {
	dragging = value;
}
