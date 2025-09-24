
import StorageManager, { ONBOARDING_STORAGE_KEYS } from './storage-manager.js';
import EventDispatcher from './event-dispatcher.js';

class ClickTracker {
	static DEDUPLICATION_WINDOW_MS = 1000;
	static MAX_CLICKS = 3;
	static lastClickTime = 0;
	static lastClickElement = null;
	static clickHandler = null;

	static setupClickTracking() {
		if ( this.clickHandler ) {
			return;
		}

		this.clickHandler = ( event ) => {
			this.trackClick( event );
		};

		document.addEventListener( 'click', this.clickHandler, true );
	}

	static trackClick( event ) {
		const currentCount = StorageManager.getNumber( ONBOARDING_STORAGE_KEYS.POST_ONBOARDING_CLICK_COUNT );

		if ( currentCount >= this.MAX_CLICKS ) {
			return;
		}

		const target = event.target;

		if ( ! this.shouldTrackClick( target ) ) {
			return;
		}

		const currentTime = Date.now();
		const timeSinceLastClick = currentTime - this.lastClickTime;

		if ( this.isDuplicateClick( target, timeSinceLastClick ) ) {
			return;
		}

		this.lastClickTime = currentTime;
		this.lastClickElement = target;

		const newCount = StorageManager.incrementNumber( ONBOARDING_STORAGE_KEYS.POST_ONBOARDING_CLICK_COUNT );
		const clickData = this.extractClickData( target );

		this.storeClickData( newCount, clickData );
		this.dispatchClickEvent( newCount );

		if ( newCount >= this.MAX_CLICKS ) {
			this.cleanup();
		}
	}

	static shouldTrackClick( target ) {
		if ( ! target || ! target.tagName ) {
			return false;
		}

		const tagName = target.tagName.toLowerCase();
		const trackableTags = [ 'button', 'a', 'input', 'select', 'textarea' ];

		if ( trackableTags.includes( tagName ) ) {
			return true;
		}

		const hasClickableRole = 'button' === target.getAttribute( 'role' ) ||
								'link' === target.getAttribute( 'role' );

		const hasClickableClass = target.classList.contains( 'elementor-button' ) ||
								target.classList.contains( 'elementor-clickable' ) ||
								target.classList.contains( 'e-btn' );

		const hasClickHandler = target.onclick || target.getAttribute( 'onclick' );

		return hasClickableRole || hasClickableClass || hasClickHandler;
	}

	static isDuplicateClick( target, timeSinceLastClick ) {
		if ( timeSinceLastClick > this.DEDUPLICATION_WINDOW_MS ) {
			return false;
		}

		return target === this.lastClickElement;
	}

	static extractClickData( element ) {
		const title = this.findMeaningfulTitle( element );
		const selector = this.generateSelector( element );

		return {
			title: title.substring( 0, 100 ),
			selector,
		};
	}

	static findMeaningfulTitle( element ) {
		const titleSources = [
			() => element.getAttribute( 'title' ),
			() => element.getAttribute( 'aria-label' ),
			() => element.textContent?.trim(),
			() => element.getAttribute( 'alt' ),
			() => element.getAttribute( 'placeholder' ),
			() => element.value,
		];

		for ( const getTitle of titleSources ) {
			const title = getTitle();
			if ( title && title.length > 0 ) {
				return title;
			}
		}

		return element.tagName.toLowerCase();
	}

	static generateSelector( element ) {
		const parts = [];
		let current = element;

		while ( current && current !== document.body && parts.length < 5 ) {
			let selector = current.tagName.toLowerCase();

			if ( current.id ) {
				selector += `#${ current.id }`;
				parts.unshift( selector );
				break;
			}

			if ( current.className ) {
				const classes = current.className.split( ' ' )
					.filter( ( cls ) => cls.length > 0 )
					.slice( 0, 2 )
					.join( '.' );
				if ( classes ) {
					selector += `.${ classes }`;
				}
			}

			parts.unshift( selector );
			current = current.parentElement;
		}

		return parts.join( ' > ' );
	}

	static storeClickData( clickCount, clickData ) {
		const dataKey = `elementor_onboarding_click_${ clickCount }_data`;
		const dataToStore = {
			...clickData,
			timestamp: Date.now(),
			clickCount,
		};

		StorageManager.setObject( dataKey, dataToStore );
	}

	static getStoredClickData( clickCount ) {
		const dataKey = `elementor_onboarding_click_${ clickCount }_data`;
		return StorageManager.getObject( dataKey );
	}

	static dispatchClickEvent( clickCount ) {
		const storedClickData = this.getStoredClickData( clickCount );
		if ( ! storedClickData ) {
			return;
		}

		const siteStarterChoiceString = StorageManager.getString( ONBOARDING_STORAGE_KEYS.STEP4_SITE_STARTER_CHOICE );
		let siteStarterChoice = null;

		if ( siteStarterChoiceString ) {
			const choiceData = StorageManager.getObject( ONBOARDING_STORAGE_KEYS.STEP4_SITE_STARTER_CHOICE );
			siteStarterChoice = choiceData?.site_starter || null;
		}

		EventDispatcher.dispatchClickEvent( clickCount, storedClickData, siteStarterChoice );
	}

	static cleanup() {
		if ( this.clickHandler ) {
			document.removeEventListener( 'click', this.clickHandler, true );
			this.clickHandler = null;
		}
		StorageManager.clearAllOnboardingData();
	}

	static silentlyIgnoreTrackingErrors() {
	}
}

export default ClickTracker;
