const RECORD_SESSION_PERCENT = 1;
const SESSION_RECORDING_STARTED_KEY = 'elementor_session_recording_started';

let sessionRecordingPairs = [];
let activeEndEvent = null;
let isRecording = false;

function hasStoredRecordingStarted() {
	try {
		return 'true' === sessionStorage.getItem( SESSION_RECORDING_STARTED_KEY );
	} catch ( error ) {}

	return false;
}

function storeRecordingStarted() {
	try {
		sessionStorage.setItem( SESSION_RECORDING_STARTED_KEY, 'true' );
	} catch ( error ) {}
}

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
 * Evaluates whether to start/stop recording based on the event name.
 *
 * @param {string}                              name
 * @param {import('mixpanel-browser').Mixpanel} mixpanelInstance
 * @return {'recording_started'|'recording_skipped'|'recording_stopped'|null} The recording decision, or null if no action taken.
 */
export function handleSessionRecording( name, mixpanelInstance ) {
	const matchedPair = sessionRecordingPairs.find( ( pair ) => pair.start === name );

	if ( matchedPair ) {
		const hasStartedInSession = hasStoredRecordingStarted();

		if ( ! hasStartedInSession && ! shouldRecordSession( mixpanelInstance.get_distinct_id(), RECORD_SESSION_PERCENT ) ) {
			isRecording = false;
			activeEndEvent = null;
			return 'recording_skipped';
		}

		if ( isRecording ) {
			return null;
		}

		mixpanelInstance.start_session_recording();
		isRecording = true;
		activeEndEvent = matchedPair.end ?? null;
		storeRecordingStarted();
		return 'recording_started';
	}

	if ( activeEndEvent && name === activeEndEvent ) {
		mixpanelInstance.stop_session_recording();
		isRecording = false;
		activeEndEvent = null;
		return 'recording_stopped';
	}

	return null;
}

export function getIsRecording() {
	return isRecording;
}
