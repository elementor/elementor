export const ATOMIC_FORM_SELECTOR = '[data-element_type="e-form"]';
export const ATOMIC_FORM_FIELD_SELECTOR = 'input[data-interaction-id], textarea[data-interaction-id], select[data-interaction-id]';
export const LINK_ACTIONS_EDITOR_WHITELIST = [ 'off_canvas', 'lightbox' ];
export const WHITELIST_FILTER = 'frontend/handlers/atomic-widgets/link-actions-whitelist';
export const ACTION_LINK_SELECTOR = '[data-action-link]';
export const REGISTRATION_SELECTOR = `${ ACTION_LINK_SELECTOR }, :has(> ${ ACTION_LINK_SELECTOR })`;
const ELEMENTOR_DOCUMENT_SELECTOR = '[data-elementor-id]';

export function isEditorContext() {
	return !! window.elementor || !! window.parent?.elementor;
}

export function getPostId( element ) {
	const innerDocumentId = element?.closest?.( ELEMENTOR_DOCUMENT_SELECTOR )?.dataset?.elementorId;
	const ownerDocument = elementorFrontend?.config?.post?.id;

	return innerDocumentId || ownerDocument || null;
}

export function getAlpineId( element ) {
	return element.getAttribute( 'x-data' );
}
