
import StorageManager, { ONBOARDING_STORAGE_KEYS } from './storage-manager.js';

class TimingManager {
	static getCurrentTime() {
		return Date.now();
	}

	static initializeOnboardingStartTime() {
		const startTime = this.getCurrentTime();
		StorageManager.setNumber( ONBOARDING_STORAGE_KEYS.START_TIME, startTime );
		StorageManager.setString( ONBOARDING_STORAGE_KEYS.INITIATED, 'true' );
		return startTime;
	}

	static getOnboardingStartTime() {
		return StorageManager.getNumber( ONBOARDING_STORAGE_KEYS.START_TIME );
	}

	static hasOnboardingStarted() {
		return StorageManager.exists( ONBOARDING_STORAGE_KEYS.START_TIME );
	}

	static trackStepStartTime( stepNumber ) {
		const existingStartTime = StorageManager.getStepStartTime( stepNumber );
		if ( existingStartTime ) {
			return existingStartTime;
		}

		const currentTime = this.getCurrentTime();
		StorageManager.setStepStartTime( stepNumber, currentTime );
		return currentTime;
	}

	static calculateStepTimeSpent( stepNumber ) {
		const stepStartTime = StorageManager.getStepStartTime( stepNumber );
		if ( ! stepStartTime ) {
			return null;
		}

		const currentTime = this.getCurrentTime();
		const stepTimeSpent = Math.round( ( currentTime - stepStartTime ) / 1000 );
		return stepTimeSpent;
	}

	static clearStepStartTime( stepNumber ) {
		StorageManager.clearStepStartTime( stepNumber );
	}

	static calculateTotalTimeSpent() {
		const startTime = this.getOnboardingStartTime();
		if ( ! startTime ) {
			return null;
		}

		const currentTime = this.getCurrentTime();
		const timeSpent = Math.round( ( currentTime - startTime ) / 1000 );

		return {
			startTime,
			currentTime,
			timeSpent,
		};
	}

	static formatTimeForEvent( timeInSeconds ) {
		if ( null === timeInSeconds || timeInSeconds === undefined ) {
			return null;
		}
		return `${ timeInSeconds }s`;
	}

	static createTimeSpentData( stepNumber = null ) {
		const totalTimeData = this.calculateTotalTimeSpent();
		const result = {};

		if ( totalTimeData ) {
			result.time_spent = this.formatTimeForEvent( totalTimeData.timeSpent );
			result.total_onboarding_time_seconds = totalTimeData.timeSpent;
			result.onboarding_start_time = totalTimeData.startTime;
		}

		if ( stepNumber ) {
			const stepTimeSpent = this.calculateStepTimeSpent( stepNumber );
			if ( stepTimeSpent !== null ) {
				result.step_time_spent = this.formatTimeForEvent( stepTimeSpent );
			}
		}

		return Object.keys( result ).length > 0 ? result : null;
	}

	static addTimingToEventData( eventData, stepNumber = null ) {
		const timingData = this.createTimeSpentData( stepNumber );
		if ( timingData ) {
			return { ...eventData, ...timingData };
		}
		return eventData;
	}

	static clearStaleSessionData() {
		const recentStepStartTimes = [];
		const currentTime = this.getCurrentTime();
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
			ONBOARDING_STORAGE_KEYS.PENDIND_TOP_UPGRADE_MOUSEOVER,
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

	static isWithinTimeThreshold( timestamp, thresholdMs = 5000 ) {
		const currentTime = this.getCurrentTime();
		return ( currentTime - timestamp ) < thresholdMs;
	}
}

export default TimingManager;
