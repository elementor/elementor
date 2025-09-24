import StorageManager, { ONBOARDING_STORAGE_KEYS } from './storage-manager.js';
import EventDispatcher from './event-dispatcher.js';

class ClickTracker {
	constructor() {
		this.DEDUPLICATION_WINDOW_MS = 150;
		this.MAX_CLICKS = 3;
		this.lastClickTime = 0;
		this.lastClickElement = null;
		this.clickHandler = null;
	}

	setupClickTracking() {
		if ( this.clickHandler ) {
			return;
		}

		this.clickHandler = ( event ) => {
			this.trackClick( event );
		};

		document.addEventListener( 'click', this.clickHandler, true );
	}

	trackClick( event ) {
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

	shouldTrackClick( element ) {
		const excludedSelectors = [
			'.announcements-container',
			'.close-button',
		];

		for ( const selector of excludedSelectors ) {
			if ( element.closest( selector ) ) {
				return false;
			}
		}

		return true;
	}

	isDuplicateClick( target, timeSinceLastClick ) {
		if ( timeSinceLastClick > this.DEDUPLICATION_WINDOW_MS ) {
			return false;
		}

		if ( ! this.lastClickElement ) {
			return false;
		}

		const isSameElement = this.lastClickElement === target;
		const isRelatedElement = this.areElementsRelated( this.lastClickElement, target );

		return isSameElement || isRelatedElement;
	}

	areElementsRelated( element1, element2 ) {
		if ( ! element1 || ! element2 ) {
			return false;
		}

		const isParentChild = element1.contains( element2 ) || element2.contains( element1 );
		const shareCommonParent = element1.parentElement === element2.parentElement;
		const bothInSameControl = element1.closest( '.elementor-control' ) === element2.closest( '.elementor-control' );

		return isParentChild || shareCommonParent || bothInSameControl;
	}

	extractClickData( element ) {
		const title = this.findMeaningfulTitle( element );
		const selector = this.generateSelector( element );

		return {
			title: title.substring( 0, 100 ),
			selector,
		};
	}

	findMeaningfulTitle( element ) {
		const directTitle = this.extractTitleFromElement( element );
		if ( directTitle && directTitle.trim().length > 0 ) {
			return directTitle.trim();
		}

		let currentElement = element.parentElement;
		let attempts = 0;
		const maxAttempts = 3;

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

	extractTitleFromElement( element ) {
		const controlFieldContainer = element.closest( '.elementor-control-field' );

		if ( controlFieldContainer ) {
			const labelElement = controlFieldContainer.querySelector( 'label' );
			if ( labelElement && labelElement.textContent ) {
				return labelElement.textContent.trim();
			}
		}

		const sources = [
			element.getAttribute( 'placeholder' ),
			element.getAttribute( 'aria-label' ),
			element.title,
			element.getAttribute( 'data-title' ),
			'select' === element.tagName?.toLowerCase() ? '' : element.textContent?.trim(),
			'select' === element.tagName?.toLowerCase() ? '' : element.innerText?.trim(),
			element.querySelector( '.elementor-widget-title' )?.textContent?.trim(),
			element.querySelector( '.elementor-heading-title' )?.textContent?.trim(),
			element.querySelector( '.elementor-button-text' )?.textContent?.trim(),
		];

		for ( const source of sources ) {
			if ( source && source.length > 0 && source !== 'undefined' ) {
				return source;
			}
		}

		return '';
	}

	generateFallbackTitle( element ) {
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

	generateSelector( element ) {
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

	storeClickData( clickCount, clickData ) {
		const dataKey = `elementor_onboarding_click_${ clickCount }_data`;
		const dataToStore = {
			...clickData,
			timestamp: Date.now(),
			clickCount,
		};

		StorageManager.setObject( dataKey, dataToStore );
	}

	getStoredClickData( clickCount ) {
		const dataKey = `elementor_onboarding_click_${ clickCount }_data`;
		return StorageManager.getObject( dataKey );
	}

	dispatchClickEvent( clickCount ) {
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

	cleanup() {
		if ( this.clickHandler ) {
			document.removeEventListener( 'click', this.clickHandler, true );
			this.clickHandler = null;
		}
		StorageManager.clearAllOnboardingData();
	}
}

const clickTracker = new ClickTracker();

export default clickTracker;
