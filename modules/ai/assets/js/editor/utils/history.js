export function toggleHistory( isActive ) {
	elementor.documents.getCurrent().history.setActive( isActive );
}
