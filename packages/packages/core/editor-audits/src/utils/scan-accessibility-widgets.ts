// Script sources of known accessibility widgets. Ally is listed first; append third-party
// widget script sources here (UserWay, AccessiBe, EqualWeb, etc.) once confirmed.
const ACCESSIBILITY_WIDGET_SCRIPT_SOURCES = [ 'cdn.elementor.com/a11y/widget.js' ];

export function hasAccessibilityWidgetScript( html: string ): boolean {
	return ACCESSIBILITY_WIDGET_SCRIPT_SOURCES.some( ( src ) => html.includes( src ) );
}
