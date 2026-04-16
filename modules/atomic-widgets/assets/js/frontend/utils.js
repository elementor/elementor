export function isEditorContext() {
	return !! window.elementor || !! window.parent?.elementor;
}

export function getPostId() {
	return elementorFrontend?.config?.post?.id || null;
}

export function getAlpineId( form ) {
	return form.getAttribute( 'x-data' );
}
