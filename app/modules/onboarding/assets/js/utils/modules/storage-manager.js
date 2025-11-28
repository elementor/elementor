export const ONBOARDING_STORAGE_KEYS = {
	START_TIME: 'elementor_onboarding_start_time',
	INITIATED: 'elementor_onboarding_initiated',
	STEP1_ACTIONS: 'elementor_onboarding_step1_actions',
	STEP2_ACTIONS: 'elementor_onboarding_step2_actions',
	STEP3_ACTIONS: 'elementor_onboarding_step3_actions',
	STEP4_ACTIONS: 'elementor_onboarding_step4_actions',
	STEP1_START_TIME: 'elementor_onboarding_s1_start_time',
	STEP2_START_TIME: 'elementor_onboarding_s2_start_time',
	STEP3_START_TIME: 'elementor_onboarding_s3_start_time',
	STEP4_START_TIME: 'elementor_onboarding_s4_start_time',
	STEP4_SITE_STARTER_CHOICE: 'elementor_onboarding_s4_site_starter_choice',
	STEP4_HAS_PREVIOUS_CLICK: 'elementor_onboarding_s4_has_previous_click',
	EDITOR_LOAD_TRACKED: 'elementor_onboarding_editor_load_tracked',
	POST_ONBOARDING_CLICK_COUNT: 'elementor_onboarding_click_count',
	PENDING_SKIP: 'elementor_onboarding_pending_skip',
	PENDING_CONNECT_STATUS: 'elementor_onboarding_pending_connect_status',
	PENDING_CREATE_ACCOUNT_STATUS: 'elementor_onboarding_pending_create_account_status',
	PENDING_CREATE_MY_ACCOUNT: 'elementor_onboarding_pending_create_my_account',
	PENDING_TOP_UPGRADE: 'elementor_onboarding_pending_top_upgrade',
	PENDING_TOP_UPGRADE_NO_CLICK: 'elementor_onboarding_pending_top_upgrade_no_click',
	PENDING_STEP1_CLICKED_CONNECT: 'elementor_onboarding_pending_step1_clicked_connect',
	PENDING_STEP1_END_STATE: 'elementor_onboarding_pending_step1_end_state',
	PENDING_EXIT: 'elementor_onboarding_pending_exit',
	PENDING_AB_101_START_AS_FREE_USER: 'elementor_onboarding_pending_ab_101_start_as_free_user',
	PENDING_TOP_UPGRADE_MOUSEOVER: 'elementor_onboarding_pending_top_upgrade_mouseover',
	EXPERIMENT101_VARIANT: 'elementor_onboarding_experiment101_variant',
	EXPERIMENT101_STARTED: 'elementor_onboarding_experiment101_started',
	EXPERIMENT201_VARIANT: 'elementor_onboarding_experiment201_variant',
	EXPERIMENT201_STARTED: 'elementor_onboarding_experiment201_started',
	EXPERIMENT202_VARIANT: 'elementor_onboarding_experiment202_variant',
	EXPERIMENT202_STARTED: 'elementor_onboarding_experiment202_started',
	EXPERIMENT401_VARIANT: 'elementor_onboarding_experiment401_variant',
	EXPERIMENT401_STARTED: 'elementor_onboarding_experiment401_started',
	EXPERIMENT402_VARIANT: 'elementor_onboarding_experiment402_variant',
	EXPERIMENT402_STARTED: 'elementor_onboarding_experiment402_started',
	PENDING_EXPERIMENT_DATA: 'elementor_onboarding_pending_experiment_data',
	STEP1_END_STATE_SENT: 'elementor_onboarding_step1_end_state_sent',
	STEP2_END_STATE_SENT: 'elementor_onboarding_step2_end_state_sent',
	STEP3_END_STATE_SENT: 'elementor_onboarding_step3_end_state_sent',
	STEP4_END_STATE_SENT: 'elementor_onboarding_step4_end_state_sent',
	STEP2_THEMES_LOADED_SENT: 'elementor_onboarding_step2_themes_loaded_sent',
	SESSION_REPLAY_STARTED: 'elementor_onboarding_session_replay_started',
};

export function getString( key ) {
	return localStorage.getItem( key );
}

export function setString( key, value ) {
	localStorage.setItem( key, value );
}

export function remove( key ) {
	localStorage.removeItem( key );
}

export function getObject( key ) {
	const storedString = getString( key );
	if ( ! storedString ) {
		return null;
	}

	try {
		const parsed = JSON.parse( storedString );
		if ( parsed && 'object' === typeof parsed ) {
			return parsed;
		}
		return null;
	} catch ( error ) {
		remove( key );
		return null;
	}
}

export function setObject( key, value ) {
	try {
		const jsonString = JSON.stringify( value );
		setString( key, jsonString );
		return true;
	} catch ( error ) {
		return false;
	}
}

export function getArray( key ) {
	const storedArray = getObject( key );
	return Array.isArray( storedArray ) ? storedArray : [];
}

export function appendToArray( key, item ) {
	const existingArray = getArray( key );
	existingArray.push( item );
	return setObject( key, existingArray );
}

export function getNumber( key, defaultValue = 0 ) {
	const storedString = getString( key );
	if ( ! storedString ) {
		return defaultValue;
	}

	const parsed = parseInt( storedString, 10 );
	return isNaN( parsed ) ? defaultValue : parsed;
}

export function setNumber( key, value ) {
	setString( key, value.toString() );
}

export function incrementNumber( key, increment = 1 ) {
	const currentValue = getNumber( key );
	const newValue = currentValue + increment;
	setNumber( key, newValue );
	return newValue;
}

export function exists( key ) {
	return getString( key ) !== null;
}

export function clearMultiple( keys ) {
	keys.forEach( ( key ) => remove( key ) );
}

export function clearAllOnboardingData() {
	const keysToRemove = [
		ONBOARDING_STORAGE_KEYS.START_TIME,
		ONBOARDING_STORAGE_KEYS.INITIATED,
		ONBOARDING_STORAGE_KEYS.STEP1_ACTIONS,
		ONBOARDING_STORAGE_KEYS.STEP2_ACTIONS,
		ONBOARDING_STORAGE_KEYS.STEP3_ACTIONS,
		ONBOARDING_STORAGE_KEYS.STEP4_ACTIONS,
		ONBOARDING_STORAGE_KEYS.STEP4_SITE_STARTER_CHOICE,
		ONBOARDING_STORAGE_KEYS.STEP4_HAS_PREVIOUS_CLICK,
		ONBOARDING_STORAGE_KEYS.EDITOR_LOAD_TRACKED,
		ONBOARDING_STORAGE_KEYS.POST_ONBOARDING_CLICK_COUNT,
		ONBOARDING_STORAGE_KEYS.PENDING_SKIP,
		ONBOARDING_STORAGE_KEYS.PENDING_CREATE_ACCOUNT_STATUS,
		ONBOARDING_STORAGE_KEYS.PENDING_CREATE_MY_ACCOUNT,
		ONBOARDING_STORAGE_KEYS.PENDING_TOP_UPGRADE,
		ONBOARDING_STORAGE_KEYS.PENDING_TOP_UPGRADE_NO_CLICK,
		ONBOARDING_STORAGE_KEYS.PENDING_CONNECT_STATUS,
		ONBOARDING_STORAGE_KEYS.PENDING_STEP1_CLICKED_CONNECT,
		ONBOARDING_STORAGE_KEYS.PENDING_STEP1_END_STATE,
		ONBOARDING_STORAGE_KEYS.PENDING_EXIT,
		ONBOARDING_STORAGE_KEYS.PENDING_AB_101_START_AS_FREE_USER,
		ONBOARDING_STORAGE_KEYS.PENDING_TOP_UPGRADE_MOUSEOVER,
		ONBOARDING_STORAGE_KEYS.STEP1_START_TIME,
		ONBOARDING_STORAGE_KEYS.STEP2_START_TIME,
		ONBOARDING_STORAGE_KEYS.STEP3_START_TIME,
		ONBOARDING_STORAGE_KEYS.STEP4_START_TIME,
	];

	clearMultiple( keysToRemove );

	for ( let i = 1; i <= 4; i++ ) {
		const clickDataKey = `elementor_onboarding_click_${ i }_data`;
		remove( clickDataKey );
	}

	remove( ONBOARDING_STORAGE_KEYS.STEP1_END_STATE_SENT );
	remove( ONBOARDING_STORAGE_KEYS.STEP2_END_STATE_SENT );
	remove( ONBOARDING_STORAGE_KEYS.STEP3_END_STATE_SENT );
	remove( ONBOARDING_STORAGE_KEYS.STEP4_END_STATE_SENT );
	remove( ONBOARDING_STORAGE_KEYS.STEP2_THEMES_LOADED_SENT );
	remove( ONBOARDING_STORAGE_KEYS.SESSION_REPLAY_STARTED );
}

export function clearExperimentData() {
	const experimentKeys = [
		ONBOARDING_STORAGE_KEYS.EXPERIMENT101_VARIANT,
		ONBOARDING_STORAGE_KEYS.EXPERIMENT101_STARTED,
		ONBOARDING_STORAGE_KEYS.EXPERIMENT201_VARIANT,
		ONBOARDING_STORAGE_KEYS.EXPERIMENT201_STARTED,
		ONBOARDING_STORAGE_KEYS.EXPERIMENT202_VARIANT,
		ONBOARDING_STORAGE_KEYS.EXPERIMENT202_STARTED,
		ONBOARDING_STORAGE_KEYS.EXPERIMENT401_VARIANT,
		ONBOARDING_STORAGE_KEYS.EXPERIMENT401_STARTED,
		ONBOARDING_STORAGE_KEYS.EXPERIMENT402_VARIANT,
		ONBOARDING_STORAGE_KEYS.EXPERIMENT402_STARTED,
		ONBOARDING_STORAGE_KEYS.PENDING_EXPERIMENT_DATA,
	];

	clearMultiple( experimentKeys );
}

export function getStepStartTime( stepNumber ) {
	const stepStartTimeKeys = {
		1: ONBOARDING_STORAGE_KEYS.STEP1_START_TIME,
		2: ONBOARDING_STORAGE_KEYS.STEP2_START_TIME,
		3: ONBOARDING_STORAGE_KEYS.STEP3_START_TIME,
		4: ONBOARDING_STORAGE_KEYS.STEP4_START_TIME,
	};

	const key = stepStartTimeKeys[ stepNumber ];
	return key ? getNumber( key ) : null;
}

export function setStepStartTime( stepNumber, timestamp ) {
	const stepStartTimeKeys = {
		1: ONBOARDING_STORAGE_KEYS.STEP1_START_TIME,
		2: ONBOARDING_STORAGE_KEYS.STEP2_START_TIME,
		3: ONBOARDING_STORAGE_KEYS.STEP3_START_TIME,
		4: ONBOARDING_STORAGE_KEYS.STEP4_START_TIME,
	};

	const key = stepStartTimeKeys[ stepNumber ];
	if ( key ) {
		setNumber( key, timestamp );
		return true;
	}
	return false;
}

export function clearStepStartTime( stepNumber ) {
	const stepStartTimeKeys = {
		1: ONBOARDING_STORAGE_KEYS.STEP1_START_TIME,
		2: ONBOARDING_STORAGE_KEYS.STEP2_START_TIME,
		3: ONBOARDING_STORAGE_KEYS.STEP3_START_TIME,
		4: ONBOARDING_STORAGE_KEYS.STEP4_START_TIME,
	};

	const key = stepStartTimeKeys[ stepNumber ];
	if ( key ) {
		remove( key );
	}
}

const StorageManager = {
	getString,
	setString,
	remove,
	getObject,
	setObject,
	getArray,
	appendToArray,
	getNumber,
	setNumber,
	incrementNumber,
	exists,
	clearMultiple,
	clearAllOnboardingData,
	clearExperimentData,
	getStepStartTime,
	setStepStartTime,
	clearStepStartTime,
};

export default StorageManager;
