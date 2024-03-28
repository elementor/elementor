
export function shouldShowPromotionIntroduction() {
	const editorSessionValue = sessionStorage.getItem( 'ai_promotion_introduction_editor_session_key' );
	if ( ! editorSessionValue || editorSessionValue !== EDITOR_SESSION_ID ) {
		sessionStorage.setItem( 'ai_promotion_introduction_editor_session_key', EDITOR_SESSION_ID );
		return true;
	}

	return false;
}
