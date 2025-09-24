/**
 * PostOnboardingTracking - Refactored with Module Pattern
 * 
 * Tracks user interactions after onboarding completion using centralized modules.
 * Eliminates code duplication and follows clean architecture principles.
 */

import StorageManager, { ONBOARDING_STORAGE_KEYS } from '../../../../../app/modules/onboarding/assets/js/utils/modules/storage-manager.js';
import EventDispatcher from '../../../../../app/modules/onboarding/assets/js/utils/modules/event-dispatcher.js';
import ClickTracker from '../../../../../app/modules/onboarding/assets/js/utils/modules/click-tracker.js';

class PostOnboardingTracking {
	static checkAndSendEditorLoadedFromOnboarding() {
		const siteStarterChoiceString = StorageManager.getString( ONBOARDING_STORAGE_KEYS.STEP4_SITE_STARTER_CHOICE );

		if ( ! siteStarterChoiceString ) {
			return;
		}

		const alreadyTracked = StorageManager.exists( ONBOARDING_STORAGE_KEYS.EDITOR_LOAD_TRACKED );
		if ( alreadyTracked ) {
			return;
		}

		this.sendEditorLoadedEvent( siteStarterChoiceString );
		StorageManager.setString( ONBOARDING_STORAGE_KEYS.EDITOR_LOAD_TRACKED, 'true' );
	}

	static sendEditorLoadedEvent( siteStarterChoiceString ) {
		const choiceData = StorageManager.getObject( ONBOARDING_STORAGE_KEYS.STEP4_SITE_STARTER_CHOICE );
		const siteStarterChoice = choiceData?.site_starter;

		if ( ! siteStarterChoice ) {
			return;
		}

		const canDispatch = EventDispatcher.canSendEvents();
		if ( canDispatch ) {
			EventDispatcher.dispatchEditorEvent( 'editor_loaded_from_onboarding', {
				editor_loaded_from_onboarding_source: siteStarterChoice,
			} );
		}
	}

	static setupPostOnboardingClickTracking() {
		const hasOnboardingData = StorageManager.exists( ONBOARDING_STORAGE_KEYS.STEP4_SITE_STARTER_CHOICE );
		if ( ! hasOnboardingData ) {
			return;
		}

		const currentCount = StorageManager.getNumber( ONBOARDING_STORAGE_KEYS.POST_ONBOARDING_CLICK_COUNT );
		if ( currentCount >= ClickTracker.MAX_CLICKS ) {
			return;
		}

		ClickTracker.setupClickTracking();
	}

	static cleanupPostOnboardingTracking() {
		ClickTracker.cleanup();
	}

	static clearAllOnboardingStorage() {
		StorageManager.clearAllOnboardingData();
	}
}

export default PostOnboardingTracking;
