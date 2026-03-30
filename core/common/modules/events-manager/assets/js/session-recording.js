const RECORD_SESSION_PERCENT = 1;

let sessionRecordingPairs = [];
let activeEndEvent = null;
let isRecording = false;

function shouldRecordSession( distinctId, percent ) {
	const fraction = Math.min( Math.max( percent / 100, 0 ), 1 );
	let hash = 0;
	for ( let i = 0; i < distinctId.length; i++ ) {
		// eslint-disable-next-line no-bitwise
		hash = ( ( hash * 31 ) + distinctId.charCodeAt( i ) ) >>> 0;
	}
	return ( hash / 4294967295 ) < fraction;
}

/**
 * @param {Array<{start: string, end?: string|null}>} pairs
 */
export function configureSessionRecording( pairs ) {
	if ( ! Array.isArray( pairs ) ) {
		return;
	}

	sessionRecordingPairs = pairs.filter( ( pair ) => 'string' === typeof pair?.start && pair.start );
}

/**
 * @param {string}                              name
 * @param {import('mixpanel-browser').Mixpanel} mixpanelInstance
 */
export function handleSessionRecording( name, mixpanelInstance ) {
	const matchedPair = sessionRecordingPairs.find( ( pair ) => pair.start === name );

	if ( matchedPair ) {
		const distinctId = mixpanelInstance.get_distinct_id();
		if ( shouldRecordSession( distinctId, RECORD_SESSION_PERCENT ) ) {
			mixpanelInstance.start_session_recording();
			isRecording = true;
			activeEndEvent = matchedPair.end ?? null;
		} else {
			isRecording = false;
			activeEndEvent = null;
		}
	} else if ( activeEndEvent && name === activeEndEvent ) {
		mixpanelInstance.stop_session_recording();
		isRecording = false;
		activeEndEvent = null;
	}
}

export function getIsRecording() {
	return isRecording;
}
