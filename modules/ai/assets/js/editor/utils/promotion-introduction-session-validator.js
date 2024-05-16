export const HOURS_BETWEEN_PROMOTION_INTRODUCTIONS = 48;
const HOURS_DELTA_IN_MILLISECONDS = HOURS_BETWEEN_PROMOTION_INTRODUCTIONS * 60 * 60 * 1000;

function passedRequiredHoursSinceLastPromotion( currentTimestamp, lastPromotionTimestamp ) {
	return currentTimestamp - parseInt( lastPromotionTimestamp ) >= HOURS_DELTA_IN_MILLISECONDS;
}

export function shouldShowPromotionIntroduction( session ) {
	const editorSessionValue = session.getItem( 'ai_promotion_introduction_editor_session_key' );
	const lastPromotionTimestamp = editorSessionValue?.split( '#' )[ 1 ];

	if ( editorSessionValue === window.EDITOR_SESSION_ID ) {
		return false;
	}

	const currentTimestamp = new Date().getTime();

	if ( ! editorSessionValue || ! lastPromotionTimestamp || passedRequiredHoursSinceLastPromotion( currentTimestamp, lastPromotionTimestamp ) ) {
		session.setItem( 'ai_promotion_introduction_editor_session_key', `${ window.EDITOR_SESSION_ID }#${ currentTimestamp }` );
		return true;
	}

	return false;
}
