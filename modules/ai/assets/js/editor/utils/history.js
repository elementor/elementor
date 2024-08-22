export function toggleHistory( isActive ) {
	elementor.documents.getCurrent().history.setActive( isActive );
}

/**
 * @param {Object}                                                                                                                                                           options
 * @param { 'add' | 'change' | 'disable' | 'duplicate' | 'enable' | 'import' | 'move' | 'paste' | 'paste_style' | 'remove' | 'reset_settings' | 'reset_style' | 'selected' } options.type
 * @param { string }                                                                                                                                                         options.title
 *
 * @return {*}
 */
export function startHistoryLog( { type, title } ) {
	const id = $e.internal( 'document/history/start-log', {
		type,
		title,
	} );

	return () => $e.internal( 'document/history/end-log', { id } );
}
