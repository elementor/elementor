const ONBOARDING_STORAGE_KEYS = {
	START_TIME: 'elementor_onboarding_start_time',
	INITIATED: 'elementor_onboarding_initiated',
	STEP1_ACTIONS: 'elementor_onboarding_step1_actions',
	STEP2_ACTIONS: 'elementor_onboarding_step2_actions',
	STEP3_ACTIONS: 'elementor_onboarding_step3_actions',
	STEP4_ACTIONS: 'elementor_onboarding_step4_actions',
	STEP4_SITE_STARTER_CHOICE: 'elementor_onboarding_s4_site_starter_choice',
	EDITOR_LOAD_TRACKED: 'elementor_onboarding_editor_load_tracked',
	POST_ONBOARDING_CLICK_COUNT: 'elementor_onboarding_click_count',
	PENDING_EXIT: 'elementor_onboarding_pending_exit',
	PENDING_SKIP: 'elementor_onboarding_pending_skip',
	PENDING_CREATE_ACCOUNT_STATUS: 'elementor_onboarding_pending_create_account_status',
	PENDING_CREATE_MY_ACCOUNT: 'elementor_onboarding_pending_create_my_account',
	PENDING_TOP_UPGRADE: 'elementor_onboarding_pending_top_upgrade',
	PENDING_CONNECT_STATUS: 'elementor_onboarding_pending_connect_status',
	PENDING_STEP1_CLICKED_CONNECT: 'elementor_onboarding_pending_step1_clicked_connect',
};

class PostOnboardingTracking {
	static warn( message, error = null ) {
		// eslint-disable-next-line no-console
		console.warn( message, error );
	}
	static checkAndSendEditorLoadedFromOnboarding() {
		try {
			// eslint-disable-next-line no-console
			console.log( 'PostOnboardingTracking: Starting checkAndSendEditorLoadedFromOnboarding' );

			const siteStarterChoiceString = localStorage.getItem( ONBOARDING_STORAGE_KEYS.STEP4_SITE_STARTER_CHOICE );
			// eslint-disable-next-line no-console
			console.log( 'PostOnboardingTracking: Site starter choice string:', siteStarterChoiceString );

			if ( ! siteStarterChoiceString ) {
				// eslint-disable-next-line no-console
				console.log( 'PostOnboardingTracking: No site starter choice found, skipping' );
				return;
			}

			const alreadyTracked = localStorage.getItem( ONBOARDING_STORAGE_KEYS.EDITOR_LOAD_TRACKED );
			// eslint-disable-next-line no-console
			console.log( 'PostOnboardingTracking: Already tracked?', alreadyTracked );

			if ( ! alreadyTracked ) {
				this.sendEditorLoadedEvent( siteStarterChoiceString );
			}

			this.setupClickTrackingIfNeeded();
		} catch ( error ) {
			this.warn( 'Failed to check and send editor loaded from onboarding:', error );
		}
	}

	static sendEditorLoadedEvent( siteStarterChoiceString ) {
		try {
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
		} catch ( error ) {
			this.warn( 'Failed to send editor loaded event:', error );
		}
	}

	static setupClickTrackingIfNeeded() {
		const clickCount = parseInt( localStorage.getItem( ONBOARDING_STORAGE_KEYS.POST_ONBOARDING_CLICK_COUNT ) || '0', 10 );
		// eslint-disable-next-line no-console
		console.log( 'PostOnboardingTracking: Current click count for setup:', clickCount );

		if ( clickCount >= 4 ) {
			// eslint-disable-next-line no-console
			console.log( 'PostOnboardingTracking: Click tracking already completed, cleaning up' );
			this.clearAllOnboardingStorage();
			return;
		}

		if ( 0 === clickCount ) {
			localStorage.setItem( ONBOARDING_STORAGE_KEYS.POST_ONBOARDING_CLICK_COUNT, '0' );
		}

		// eslint-disable-next-line no-console
		console.log( 'PostOnboardingTracking: Setting up click tracking' );
		this.setupPostOnboardingClickTracking();
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
			// eslint-disable-next-line no-console
			console.log( 'PostOnboardingTracking: Current click count:', currentCount );

			if ( currentCount > 3 ) {
				// eslint-disable-next-line no-console
				console.log( 'PostOnboardingTracking: Max clicks reached, stopping tracking' );
				return;
			}

			const newCount = currentCount + 1;
			localStorage.setItem( ONBOARDING_STORAGE_KEYS.POST_ONBOARDING_CLICK_COUNT, newCount.toString() );
			// eslint-disable-next-line no-console
			console.log( 'PostOnboardingTracking: New click count:', newCount );

			if ( 1 === newCount ) {
				// eslint-disable-next-line no-console
				console.log( 'PostOnboardingTracking: Skipping first click' );
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
						this.warn( 'Failed to parse site starter choice:', error );
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
			this.warn( 'Failed to track post-onboarding click:', error );
		}
	}

	static extractClickData( element ) {
		const title = this.findMeaningfulTitle( element );
		const selector = this.generateLongSelector( element );

		return {
			title: title.substring( 0, 100 ),
			selector,
		};
	}

	static findMeaningfulTitle( element ) {
		let currentElement = element;
		let attempts = 0;
		const maxAttempts = 5;

		while ( currentElement && attempts < maxAttempts ) {
			const title = this.extractTitleFromElement( currentElement );

			if ( title && title.trim().length > 0 ) {
				return title.trim();
			}

			currentElement = currentElement.parentElement;
			attempts++;
		}

		return this.generateFallbackTitle( element );
	}

	static extractTitleFromElement( element ) {
		const sources = [
			element.title,
			element.getAttribute( 'aria-label' ),
			element.getAttribute( 'data-tooltip' ),
			element.getAttribute( 'data-title' ),
			element.textContent?.trim(),
			element.innerText?.trim(),
			element.querySelector( '.elementor-widget-title' )?.textContent?.trim(),
			element.querySelector( '.elementor-heading-title' )?.textContent?.trim(),
			element.querySelector( '.elementor-button-text' )?.textContent?.trim(),
			element.querySelector( '[data-tooltip]' )?.getAttribute( 'data-tooltip' ),
		];

		for ( const source of sources ) {
			if ( source && source.length > 0 && source !== 'undefined' ) {
				return source;
			}
		}

		return '';
	}

	static generateFallbackTitle( element ) {
		const tagName = element.tagName?.toLowerCase() || 'element';
		const className = element.className || '';

		if ( className.includes( 'eicon-' ) ) {
			const iconClass = className.split( ' ' ).find( ( cls ) => cls.startsWith( 'eicon-' ) );
			if ( iconClass ) {
				return iconClass.replace( 'eicon-', '' ).replace( '-', ' ' );
			}
		}

		if ( className.includes( 'elementor-button' ) ) {
			return 'Elementor Button';
		}

		if ( className.includes( 'elementor-widget' ) ) {
			return 'Elementor Widget';
		}

		return `${ tagName } element`;
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
			this.warn( 'Failed to cleanup post-onboarding tracking:', error );
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
			ONBOARDING_STORAGE_KEYS.EDITOR_LOAD_TRACKED,
			ONBOARDING_STORAGE_KEYS.POST_ONBOARDING_CLICK_COUNT,
			ONBOARDING_STORAGE_KEYS.PENDING_EXIT,
			ONBOARDING_STORAGE_KEYS.PENDING_SKIP,
			ONBOARDING_STORAGE_KEYS.PENDING_CREATE_ACCOUNT_STATUS,
			ONBOARDING_STORAGE_KEYS.PENDING_CREATE_MY_ACCOUNT,
			ONBOARDING_STORAGE_KEYS.PENDING_TOP_UPGRADE,
			ONBOARDING_STORAGE_KEYS.PENDING_CONNECT_STATUS,
			ONBOARDING_STORAGE_KEYS.PENDING_STEP1_CLICKED_CONNECT,
		];

		keysToRemove.forEach( ( key ) => {
			localStorage.removeItem( key );
		} );
	}
}

export default PostOnboardingTracking;
