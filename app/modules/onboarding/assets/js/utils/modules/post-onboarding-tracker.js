import StorageManager, { ONBOARDING_STORAGE_KEYS } from './storage-manager.js';
import EventDispatcher from './event-dispatcher.js';
import { ONBOARDING_EVENTS } from './onboarding-event-names.js';
import ClickTracker from './click-tracker.js';

class PostOnboardingTracker {
	checkAndSendEditorLoadedFromOnboarding() {
		const siteStarterChoiceString = StorageManager.getString( ONBOARDING_STORAGE_KEYS.STEP4_SITE_STARTER_CHOICE );

		if ( ! siteStarterChoiceString ) {
			return;
		}

		const alreadyTracked = StorageManager.exists( ONBOARDING_STORAGE_KEYS.EDITOR_LOAD_TRACKED );
		if ( alreadyTracked ) {
			this.setupPostOnboardingClickTracking();
			return;
		}

		this.sendEditorLoadedEvent();
		StorageManager.setString( ONBOARDING_STORAGE_KEYS.EDITOR_LOAD_TRACKED, 'true' );

		this.setupPostOnboardingClickTracking();
	}

	sendEditorLoadedEvent() {
		const choiceData = StorageManager.getObject( ONBOARDING_STORAGE_KEYS.STEP4_SITE_STARTER_CHOICE );
		const siteStarterChoice = choiceData?.site_starter;

		if ( ! siteStarterChoice ) {
			return;
		}

		EventDispatcher.trackEvent( ONBOARDING_EVENTS.EDITOR_LOADED, {
			window_name: 'editor',
			interaction_type: 'load',
			target_type: 'loaded',
			target_name: 'editor_from_onboarding',
			interaction_result: 'editor_loaded',
			target_value: siteStarterChoice,
			target_location: 'editor',
			location_l1: 'editor',
		} );
	}

	setupPostOnboardingClickTracking() {
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

	cleanupPostOnboardingTracking() {
		ClickTracker.cleanup();
	}

	clearAllOnboardingStorage() {
		StorageManager.clearAllOnboardingData();
		StorageManager.clearExperimentData();
	}
}

const postOnboardingTracker = new PostOnboardingTracker();

export default postOnboardingTracker;
