import StorageManager, { ONBOARDING_STORAGE_KEYS } from './storage-manager.js';
import EventDispatcher from './event-dispatcher.js';
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

		const canDispatch = EventDispatcher.canSendEvents();
		if ( canDispatch ) {
			EventDispatcher.dispatchEditorEvent( 'editor_loaded_from_onboarding', {
				editor_loaded_from_onboarding_source: siteStarterChoice,
			} );
		}
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
		StorageManager.remove( ONBOARDING_STORAGE_KEYS.SESSION_REPLAY_STARTED );
	}

	clearAllOnboardingStorage() {
		StorageManager.clearAllOnboardingData();
		StorageManager.clearExperimentData();
	}
}

const postOnboardingTracker = new PostOnboardingTracker();

export default postOnboardingTracker;
