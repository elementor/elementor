export function getSiteBuilderConfig() {
	return window.elementorAppConfig?.[ 'site-builder' ];
}

export function getElementorAiCurrentContext() {
	return getSiteBuilderConfig()?.elementorAiCurrentContext || {};
}
