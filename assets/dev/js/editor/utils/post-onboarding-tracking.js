// Define the storage keys directly to avoid import issues
const ONBOARDING_STORAGE_KEYS = {
	STEP4_SITE_STARTER_CHOICE: 'elementor_onboarding_s4_site_starter_choice',
	EDITOR_LOAD_TRACKED: 'elementor_onboarding_editor_load_tracked',
	POST_ONBOARDING_CLICK_COUNT: 'elementor_onboarding_click_count',
};

class PostOnboardingTracking {
	static checkAndSendEditorLoadedFromOnboarding() {
		try {
			// eslint-disable-next-line no-console
			console.log( 'PostOnboardingTracking: Starting checkAndSendEditorLoadedFromOnboarding' );

			const alreadyTracked = localStorage.getItem( ONBOARDING_STORAGE_KEYS.EDITOR_LOAD_TRACKED );
			// eslint-disable-next-line no-console
			console.log( 'PostOnboardingTracking: Already tracked?', alreadyTracked );
			if ( alreadyTracked ) {
				return;
			}

			const siteStarterChoiceString = localStorage.getItem( ONBOARDING_STORAGE_KEYS.STEP4_SITE_STARTER_CHOICE );
			// eslint-disable-next-line no-console
			console.log( 'PostOnboardingTracking: Site starter choice string:', siteStarterChoiceString );
			if ( ! siteStarterChoiceString ) {
				return;
			}

			const choiceData = JSON.parse( siteStarterChoiceString );
			const siteStarterChoice = choiceData.site_starter;
			// eslint-disable-next-line no-console
			console.log( 'PostOnboardingTracking: Site starter choice:', siteStarterChoice );

			if ( ! siteStarterChoice ) {
				return;
			}

			const canDispatch = elementorCommon.eventsManager && 'function' === typeof elementorCommon.eventsManager.dispatchEvent;
			// eslint-disable-next-line no-console
			console.log( 'PostOnboardingTracking: Can dispatch events?', canDispatch );

			if ( canDispatch ) {
				// eslint-disable-next-line no-console
				console.log( 'PostOnboardingTracking: Dispatching editor_loaded_from_onboarding event' );
				elementorCommon.eventsManager.dispatchEvent( 'editor_loaded_from_onboarding', {
					location: 'editor',
					trigger: 'elementor_loaded',
					editor_loaded_from_onboarding_source: siteStarterChoice,
				} );
			}

			localStorage.setItem( ONBOARDING_STORAGE_KEYS.EDITOR_LOAD_TRACKED, 'true' );
			localStorage.setItem( ONBOARDING_STORAGE_KEYS.POST_ONBOARDING_CLICK_COUNT, '0' );
			// eslint-disable-next-line no-console
			console.log( 'PostOnboardingTracking: Setting up click tracking' );
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
			const currentCount = parseInt( localStorage.getItem( ONBOARDING_STORAGE_KEYS.POST_ONBOARDING_CLICK_COUNT ) || '0', 10 );

			if ( currentCount > 3 ) {
				return;
			}

			const newCount = currentCount + 1;
			localStorage.setItem( ONBOARDING_STORAGE_KEYS.POST_ONBOARDING_CLICK_COUNT, newCount.toString() );

			if ( 1 === newCount ) {
				return;
			}

			const target = event.target;
			const clickData = this.extractClickData( target );
			const eventName = this.getClickEventName( newCount );

			if ( eventName ) {
				const siteStarterChoiceString = localStorage.getItem( ONBOARDING_STORAGE_KEYS.STEP4_SITE_STARTER_CHOICE );
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
					const clickNumber = this.getClickNumber( newCount );
					const eventData = {
						location: 'editor',
						trigger: 'click',
						editor_loaded_from_onboarding_source: siteStarterChoice,
					};

					eventData[ `post_onboarding_${ clickNumber }_click_action_title` ] = clickData.title;
					eventData[ `post_onboarding_${ clickNumber }_click_action_selector` ] = clickData.selector;

					elementorCommon.eventsManager.dispatchEvent( eventName, eventData );
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
		const selector = this.generateLongSelector( element );

		return {
			title: title.substring( 0, 100 ),
			selector,
		};
	}

	static generateLongSelector( element ) {
		const selectorParts = [];
		let currentElement = element;

		for ( let i = 0; i < 4 && currentElement && currentElement !== document.body; i++ ) {
			let selector = currentElement.tagName.toLowerCase();

			if ( 0 === i && currentElement.id ) {
				selector += `#${ currentElement.id }`;
			} else if ( currentElement.classList.length > 0 ) {
				const classes = Array.from( currentElement.classList ).slice( 0, 3 );
				selector += `.${ classes.join( '.' ) }`;
			}

			selectorParts.unshift( selector );
			currentElement = currentElement.parentElement;
		}

		return selectorParts.join( ' > ' );
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

	static getClickNumber( clickCount ) {
		switch ( clickCount ) {
			case 2:
				return '1st';
			case 3:
				return '2nd';
			case 4:
				return '3rd';
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
			ONBOARDING_STORAGE_KEYS.START_TIME,
			ONBOARDING_STORAGE_KEYS.INITIATED,
			ONBOARDING_STORAGE_KEYS.STEP1_ACTIONS,
			ONBOARDING_STORAGE_KEYS.STEP2_ACTIONS,
			ONBOARDING_STORAGE_KEYS.STEP3_ACTIONS,
			ONBOARDING_STORAGE_KEYS.STEP4_ACTIONS,
			ONBOARDING_STORAGE_KEYS.STEP4_SITE_STARTER_CHOICE,
			ONBOARDING_STORAGE_KEYS.PENDING_EXIT,
			ONBOARDING_STORAGE_KEYS.PENDING_SKIP,
			ONBOARDING_STORAGE_KEYS.PENDING_CREATE_ACCOUNT_STATUS,
			ONBOARDING_STORAGE_KEYS.PENDING_CREATE_MY_ACCOUNT,
			ONBOARDING_STORAGE_KEYS.PENDING_TOP_UPGRADE,
		];

		keysToRemove.forEach( ( key ) => {
			localStorage.removeItem( key );
		} );
	}
}

export default PostOnboardingTracking;
