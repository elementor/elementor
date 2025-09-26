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
	PENDING_EXIT_BUTTON: 'elementor_onboarding_pending_exit_button',
	PENDIND_TOP_UPGRADE_MOUSEOVER: 'elementor_onboarding_pending_top_upgrade_mouseover',
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
		return JSON.parse( storedString );
	} catch ( error ) {
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
		ONBOARDING_STORAGE_KEYS.PENDING_CONNECT_STATUS,
		ONBOARDING_STORAGE_KEYS.PENDING_STEP1_CLICKED_CONNECT,
		ONBOARDING_STORAGE_KEYS.PENDING_EXIT_BUTTON,
		ONBOARDING_STORAGE_KEYS.STEP1_START_TIME,
	];

	clearMultiple( keysToRemove );

	for ( let i = 1; i <= 4; i++ ) {
		const clickDataKey = `elementor_onboarding_click_${ i }_data`;
		remove( clickDataKey );
	}
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
	getStepStartTime,
	setStepStartTime,
	clearStepStartTime,
};

export default StorageManager;
