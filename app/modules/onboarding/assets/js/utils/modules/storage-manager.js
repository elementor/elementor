
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
	PENDIND_TOP_UPGRADE_MOUSEOVER: 'elementor_onboarding_pending_top_upgrade_mouseover',
};

class StorageManager {
	static getString( key ) {
		return localStorage.getItem( key );
	}

	static setString( key, value ) {
		localStorage.setItem( key, value );
	}

	static remove( key ) {
		localStorage.removeItem( key );
	}

	static getObject( key ) {
		const storedString = this.getString( key );
		if ( ! storedString ) {
			return null;
		}

		try {
			return JSON.parse( storedString );
		} catch ( error ) {
			return null;
		}
	}

	static setObject( key, value ) {
		try {
			const jsonString = JSON.stringify( value );
			this.setString( key, jsonString );
			return true;
		} catch ( error ) {
			return false;
		}
	}

	static getArray( key ) {
		const storedArray = this.getObject( key );
		return Array.isArray( storedArray ) ? storedArray : [];
	}

	static appendToArray( key, item ) {
		const existingArray = this.getArray( key );
		existingArray.push( item );
		return this.setObject( key, existingArray );
	}

	static getNumber( key, defaultValue = 0 ) {
		const storedString = this.getString( key );
		if ( ! storedString ) {
			return defaultValue;
		}

		const parsed = parseInt( storedString, 10 );
		return isNaN( parsed ) ? defaultValue : parsed;
	}

	static setNumber( key, value ) {
		this.setString( key, value.toString() );
	}

	static incrementNumber( key, increment = 1 ) {
		const currentValue = this.getNumber( key );
		const newValue = currentValue + increment;
		this.setNumber( key, newValue );
		return newValue;
	}

	static exists( key ) {
		return this.getString( key ) !== null;
	}

	static clearMultiple( keys ) {
		keys.forEach( ( key ) => this.remove( key ) );
	}

	static clearAllOnboardingData() {
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
		];

		this.clearMultiple( keysToRemove );

		for ( let i = 1; i <= 4; i++ ) {
			const clickDataKey = `elementor_onboarding_click_${ i }_data`;
			this.remove( clickDataKey );
		}
	}

	static getStepStartTime( stepNumber ) {
		const stepStartTimeKeys = {
			1: ONBOARDING_STORAGE_KEYS.STEP1_START_TIME,
			2: ONBOARDING_STORAGE_KEYS.STEP2_START_TIME,
			3: ONBOARDING_STORAGE_KEYS.STEP3_START_TIME,
			4: ONBOARDING_STORAGE_KEYS.STEP4_START_TIME,
		};

		const key = stepStartTimeKeys[ stepNumber ];
		return key ? this.getNumber( key ) : null;
	}

	static setStepStartTime( stepNumber, timestamp ) {
		const stepStartTimeKeys = {
			1: ONBOARDING_STORAGE_KEYS.STEP1_START_TIME,
			2: ONBOARDING_STORAGE_KEYS.STEP2_START_TIME,
			3: ONBOARDING_STORAGE_KEYS.STEP3_START_TIME,
			4: ONBOARDING_STORAGE_KEYS.STEP4_START_TIME,
		};

		const key = stepStartTimeKeys[ stepNumber ];
		if ( key ) {
			this.setNumber( key, timestamp );
			return true;
		}
		return false;
	}

	static clearStepStartTime( stepNumber ) {
		const stepStartTimeKeys = {
			1: ONBOARDING_STORAGE_KEYS.STEP1_START_TIME,
			2: ONBOARDING_STORAGE_KEYS.STEP2_START_TIME,
			3: ONBOARDING_STORAGE_KEYS.STEP3_START_TIME,
			4: ONBOARDING_STORAGE_KEYS.STEP4_START_TIME,
		};

		const key = stepStartTimeKeys[ stepNumber ];
		if ( key ) {
			this.remove( key );
		}
	}
}

export default StorageManager;
