import * as StorageManager from './storage-manager.js';
import { ONBOARDING_STORAGE_KEYS } from './storage-manager.js';

export function getCurrentTime() {
	return Date.now();
}

export function initializeOnboardingStartTime() {
	const startTime = getCurrentTime();
	StorageManager.setNumber( ONBOARDING_STORAGE_KEYS.START_TIME, startTime );
	StorageManager.setString( ONBOARDING_STORAGE_KEYS.INITIATED, 'true' );
	return startTime;
}

export function getOnboardingStartTime() {
	return StorageManager.getNumber( ONBOARDING_STORAGE_KEYS.START_TIME );
}

export function hasOnboardingStarted() {
	return StorageManager.exists( ONBOARDING_STORAGE_KEYS.START_TIME );
}

export function trackStepStartTime( stepNumber ) {
	const existingStartTime = StorageManager.getStepStartTime( stepNumber );
	if ( existingStartTime ) {
		return existingStartTime;
	}

	const currentTime = getCurrentTime();
	StorageManager.setStepStartTime( stepNumber, currentTime );
	return currentTime;
}

export function calculateStepTimeSpent( stepNumber ) {
	const stepStartTime = StorageManager.getStepStartTime( stepNumber );
	if ( ! stepStartTime ) {
		return null;
	}

	const currentTime = getCurrentTime();
	const stepTimeSpent = Math.round( ( currentTime - stepStartTime ) / 1000 );
	return stepTimeSpent;
}

export function clearStepStartTime( stepNumber ) {
	StorageManager.clearStepStartTime( stepNumber );
}

export function calculateTotalTimeSpent() {
	const startTime = getOnboardingStartTime();
	if ( ! startTime ) {
		return null;
	}

	const currentTime = getCurrentTime();
	const timeSpent = Math.round( ( currentTime - startTime ) / 1000 );

	return {
		startTime,
		currentTime,
		timeSpent,
	};
}

export function formatTimeForEvent( timeInSeconds ) {
	if ( null === timeInSeconds || timeInSeconds === undefined ) {
		return null;
	}
	return `${ timeInSeconds }s`;
}

export function createTimeSpentData( stepNumber = null ) {
	const totalTimeData = calculateTotalTimeSpent();
	const result = {};

	if ( totalTimeData ) {
		result.time_spent = formatTimeForEvent( totalTimeData.timeSpent );
		result.total_onboarding_time_seconds = totalTimeData.timeSpent;
		result.onboarding_start_time = totalTimeData.startTime;
	}

	if ( stepNumber ) {
		const stepTimeSpent = calculateStepTimeSpent( stepNumber );
		if ( stepTimeSpent !== null ) {
			result.step_time_spent = formatTimeForEvent( stepTimeSpent );
		}
	}

	return Object.keys( result ).length > 0 ? result : null;
}

export function addTimingToEventData( eventData, stepNumber = null ) {
	const timingData = createTimeSpentData( stepNumber );
	if ( timingData ) {
		return { ...eventData, ...timingData };
	}
	return eventData;
}

export function clearStaleSessionData() {
	const recentStepStartTimes = [];
	const currentTime = getCurrentTime();
	const recentStepStartTimeThresholdMs = 5000;

	[
		ONBOARDING_STORAGE_KEYS.STEP1_START_TIME,
		ONBOARDING_STORAGE_KEYS.STEP2_START_TIME,
		ONBOARDING_STORAGE_KEYS.STEP3_START_TIME,
		ONBOARDING_STORAGE_KEYS.STEP4_START_TIME,
	].forEach( ( key ) => {
		const value = StorageManager.getString( key );
		if ( value ) {
			const timestamp = parseInt( value, 10 );
			const age = currentTime - timestamp;
			if ( age < recentStepStartTimeThresholdMs ) {
				recentStepStartTimes.push( key );
			}
		}
	} );

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
		ONBOARDING_STORAGE_KEYS.PENDING_CONNECT_STATUS,
		ONBOARDING_STORAGE_KEYS.PENDING_CREATE_ACCOUNT_STATUS,
		ONBOARDING_STORAGE_KEYS.PENDING_CREATE_MY_ACCOUNT,
		ONBOARDING_STORAGE_KEYS.PENDING_TOP_UPGRADE,
		ONBOARDING_STORAGE_KEYS.PENDING_TOP_UPGRADE_NO_CLICK,
		ONBOARDING_STORAGE_KEYS.PENDING_STEP1_CLICKED_CONNECT,
		ONBOARDING_STORAGE_KEYS.PENDING_STEP1_END_STATE,
		ONBOARDING_STORAGE_KEYS.PENDING_EXIT_BUTTON,
		ONBOARDING_STORAGE_KEYS.PENDING_TOP_UPGRADE_MOUSEOVER,
	];

	keysToRemove.forEach( ( key ) => {
		if ( ! recentStepStartTimes.includes( key ) ) {
			StorageManager.remove( key );
		}
	} );

	[
		ONBOARDING_STORAGE_KEYS.STEP1_START_TIME,
		ONBOARDING_STORAGE_KEYS.STEP2_START_TIME,
		ONBOARDING_STORAGE_KEYS.STEP3_START_TIME,
		ONBOARDING_STORAGE_KEYS.STEP4_START_TIME,
	].forEach( ( key ) => {
		if ( ! recentStepStartTimes.includes( key ) ) {
			StorageManager.remove( key );
		}
	} );
}

export function isWithinTimeThreshold( timestamp, thresholdMs = 5000 ) {
	const currentTime = getCurrentTime();
	return ( currentTime - timestamp ) < thresholdMs;
}

const TimingManager = {
	getCurrentTime,
	initializeOnboardingStartTime,
	getOnboardingStartTime,
	hasOnboardingStarted,
	trackStepStartTime,
	calculateStepTimeSpent,
	clearStepStartTime,
	calculateTotalTimeSpent,
	formatTimeForEvent,
	createTimeSpentData,
	addTimingToEventData,
	clearStaleSessionData,
	isWithinTimeThreshold,
};

export default TimingManager;
