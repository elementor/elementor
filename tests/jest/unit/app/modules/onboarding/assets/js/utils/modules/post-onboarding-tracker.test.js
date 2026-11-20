const mockTrackEvent = jest.fn();

jest.mock( '../../../../../../../../../../app/modules/onboarding/assets/js/utils/modules/event-dispatcher.js', () => ( {
	__esModule: true,
	default: {
		trackEvent: ( ...args ) => mockTrackEvent( ...args ),
	},
} ) );

import StorageManager, { ONBOARDING_STORAGE_KEYS } from '../../../../../../../../../../app/modules/onboarding/assets/js/utils/modules/storage-manager.js';
import PostOnboardingTracker from '../../../../../../../../../../app/modules/onboarding/assets/js/utils/modules/post-onboarding-tracker.js';
import { ONBOARDING_EVENTS } from '../../../../../../../../../../app/modules/onboarding/assets/js/utils/modules/onboarding-event-names.js';

beforeEach( () => {
	localStorage.clear();
	mockTrackEvent.mockClear();
} );

describe( 'post onboarding handoff', () => {
	test( 'records editor entry once', () => {
		StorageManager.setObject( ONBOARDING_STORAGE_KEYS.STEP4_SITE_STARTER_CHOICE, {
			site_starter: 'blank_canvas',
		} );

		PostOnboardingTracker.checkAndSendEditorLoadedFromOnboarding();
		PostOnboardingTracker.checkAndSendEditorLoadedFromOnboarding();

		expect( mockTrackEvent ).toHaveBeenCalledTimes( 1 );
		expect( mockTrackEvent ).toHaveBeenCalledWith(
			ONBOARDING_EVENTS.EDITOR_LOADED,
			expect.objectContaining( {
				window_name: 'editor',
				target_value: 'blank_canvas',
			} ),
		);
	} );
} );
