class PostOnboardingTracking {
	static checkAndSendEditorLoadedFromOnboarding() {
		try {
			const alreadyTracked = localStorage.getItem( 'elementor_onboarding_editor_load_tracked' );
			if ( alreadyTracked ) {
				return;
			}

			const siteStarterChoiceString = localStorage.getItem( 'elementor_onboarding_s4_site_starter_choice' );
			if ( ! siteStarterChoiceString ) {
				return;
			}

			const choiceData = JSON.parse( siteStarterChoiceString );
			const siteStarterChoice = choiceData.site_starter;

			if ( ! siteStarterChoice ) {
				return;
			}

			if ( elementorCommon.eventsManager && 'function' === typeof elementorCommon.eventsManager.dispatchEvent ) {
				elementorCommon.eventsManager.dispatchEvent( 'editor_loaded_from_onboarding', {
					location: 'editor',
					trigger: 'elementor_loaded',
					editor_loaded_from_onboarding_source: siteStarterChoice,
				} );
			}

			localStorage.setItem( 'elementor_onboarding_editor_load_tracked', 'true' );
			localStorage.setItem( 'elementor_onboarding_click_count', '0' );
			this.setupPostOnboardingClickTracking();
		} catch ( error ) {
			// eslint-disable-next-line no-console
			console.warn( 'Failed to check and send editor loaded from onboarding:', error );
		}
	}

	static setupPostOnboardingClickTracking() {
		if ( 'undefined' === typeof document ) {
			return;
		}

		const handleClick = ( event ) => {
			this.trackPostOnboardingClick( event );
		};

		document.addEventListener( 'click', handleClick, true );
	}

	static trackPostOnboardingClick( event ) {
		try {
			const currentCount = parseInt( localStorage.getItem( 'elementor_onboarding_click_count' ) || '0', 10 );

			if ( currentCount > 3 ) {
				return;
			}

			const newCount = currentCount + 1;
			localStorage.setItem( 'elementor_onboarding_click_count', newCount.toString() );

			if ( 1 === newCount ) {
				return;
			}

			const target = event.target;
			const clickData = this.extractClickData( target );
			const eventName = this.getClickEventName( newCount );

			if ( eventName ) {
				const siteStarterChoiceString = localStorage.getItem( 'elementor_onboarding_s4_site_starter_choice' );
				let siteStarterChoice = null;

				if ( siteStarterChoiceString ) {
					try {
						const choiceData = JSON.parse( siteStarterChoiceString );
						siteStarterChoice = choiceData.site_starter;
					} catch ( error ) {
						// eslint-disable-next-line no-console
						console.warn( 'Failed to parse site starter choice:', error );
					}
				}

				if ( elementorCommon.eventsManager && 'function' === typeof elementorCommon.eventsManager.dispatchEvent ) {
					elementorCommon.eventsManager.dispatchEvent( eventName, {
						location: 'editor',
						trigger: 'click',
						editor_loaded_from_onboarding_source: siteStarterChoice,
						element_title: clickData.title,
						element_id: clickData.id,
						element_type: clickData.type,
					} );
				}
			}

			if ( newCount >= 4 ) {
				this.cleanupPostOnboardingTracking();
			}
		} catch ( error ) {
			// eslint-disable-next-line no-console
			console.warn( 'Failed to track post-onboarding click:', error );
		}
	}

	static extractClickData( element ) {
		const title = element.title || element.textContent?.trim() || element.getAttribute( 'aria-label' ) || '';
		const id = element.id || '';
		const type = element.tagName?.toLowerCase() || '';

		return {
			title: title.substring( 0, 100 ),
			id,
			type,
		};
	}

	static getClickEventName( clickCount ) {
		switch ( clickCount ) {
			case 2:
				return 'post_onboarding_1st_click';
			case 3:
				return 'post_onboarding_2nd_click';
			case 4:
				return 'post_onboarding_3rd_click';
			default:
				return null;
		}
	}

	static cleanupPostOnboardingTracking() {
		try {
			document.removeEventListener( 'click', this.trackPostOnboardingClick );
			this.clearAllOnboardingStorage();
		} catch ( error ) {
			// eslint-disable-next-line no-console
			console.warn( 'Failed to cleanup post-onboarding tracking:', error );
		}
	}

	static clearAllOnboardingStorage() {
		const keysToRemove = [
			'elementor_onboarding_start_time',
			'elementor_onboarding_initiated',
			'elementor_onboarding_s1_actions',
			'elementor_onboarding_s2_actions',
			'elementor_onboarding_s3_actions',
			'elementor_onboarding_s4_actions',
			'elementor_onboarding_s4_site_starter_choice',
			'elementor_onboarding_pending_exit',
			'elementor_onboarding_pending_skip',
			'elementor_onboarding_pending_create_account_status',
			'elementor_onboarding_pending_create_my_account',
			'elementor_onboarding_pending_top_upgrade',
		];

		keysToRemove.forEach( ( key ) => {
			localStorage.removeItem( key );
		} );
	}
}

export default PostOnboardingTracking;
