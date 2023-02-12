import { ScrubbingMode } from 'elementor-document/ui-states';

const SCRUB_REGULAR = 'UPDATE-VALUE';
const SCRUB_ENHANCED = 'UPDATE-VALUE-ENHANCED';
const SKIP_SCRUB = 'SKIP-UPDATE-VALUE';

export default class Scrubbing extends Marionette.Behavior {
	checkIntentTimeout = null;

	skipperCount = 0;

	constructor( ...args ) {
		super( ...args );

		const userOptions = this.getOption( 'scrubSettings' ) || {};

		this.scrubSettings = {
			intentTime: 600,
			skipperSteps: 10,
			valueModifier: 1,
			enhancedNumber: 10,
			scrubbingActiveClass: 'e-scrubbing--active',
			scrubbingOverClass: 'e-scrubbing-over',
			...userOptions,
		};
	}

	ui() {
		return {
			input: 'input[type=number]',
			label: 'label[for^="elementor-control-"]',
		};
	}

	events() {
		return {
			'mousedown @ui.input': 'onMouseDownInput',
			'mousedown @ui.label': 'onMouseDownLabel',
			'mouseenter @ui.label': 'onMouseEnterLabel',
			'mouseleave @ui.label': 'onMouseLeaveLabel',
		};
	}

	scrub( input, movementEvent ) {
		const movementType = this.getMovementType( movementEvent );

		if ( SKIP_SCRUB === movementType ) {
			return;
		}

		switch ( movementType ) {
			case SCRUB_REGULAR:
				input.value = this.getModifiedValue( {
					value: input.value,
					change: movementEvent.movementX,
					modifier: this.scrubSettings.valueModifier,
				} );
				break;

			case SCRUB_ENHANCED:
				input.value = this.getModifiedValue( {
					value: input.value,
					change: movementEvent.movementX,
					modifier: this.scrubSettings.enhancedNumber,
				} );
				break;

			default:
				break;
		}

		// Fire an input event so other behaviors/validators can handle the new input
		input.dispatchEvent( new Event( 'input', { bubbles: true } ) );
	}

	getMovementType( movementEvent ) {
		if ( movementEvent.altKey ) {
			this.skipperCount++;

			// When ALT key is pressed, skipping x times before updating input value.
			// 'skipperSteps' defines the exact times to skip, can be changed to any number.
			if ( this.skipperCount <= this.scrubSettings.skipperSteps ) {
				return SKIP_SCRUB;
			}

			this.skipperCount = 0;

			return SCRUB_REGULAR;
		}

		return ( movementEvent.ctrlKey || movementEvent.metaKey ) ? SCRUB_ENHANCED : SCRUB_REGULAR;
	}

	getModifiedValue( { value, change, modifier } ) {
		if ( 'function' === typeof modifier ) {
			modifier = modifier();
		}

		const newValue = +value + ( change * modifier );

		// Prevent cases where the value resolves to something like 1.0000000000000001.
		return parseFloat( newValue.toFixed( 1 ) );
	}

	isInputValidForScrubbing( input ) {
		return input && ! input.disabled && 'number' === input.type;
	}

	/**
	 * @param {HTMLElement[]} elements
	 */
	setActive( elements ) {
		elements.forEach( ( element ) => {
			element.classList.add( this.scrubSettings.scrubbingActiveClass );
		} );
	}

	/**
	 * @param {HTMLElement[]} elements
	 */
	setInactive( elements ) {
		elements.forEach( ( element ) => {
			element.classList.remove( this.scrubSettings.scrubbingActiveClass );
		} );
	}

	onMouseDownInput( e ) {
		const input = e.target;

		if ( ! this.isInputValidForScrubbing( input ) ) {
			return;
		}

		const trackMovement = ( movementEvent ) => {
			this.scrub( input, movementEvent );
		};

		// For input, scrubbing effect works only after X time the mouse is down.
		const checkIntentTimeout = setTimeout( () => {
			clearTimeout( checkIntentTimeout );
			document.addEventListener( 'mousemove', trackMovement );

			$e.uiStates.set( 'document/scrubbing-mode', ScrubbingMode.ON );
			this.setActive( [ input ] );
		}, this.scrubSettings.intentTime );

		document.addEventListener( 'mouseup', () => {
			document.removeEventListener( 'mousemove', trackMovement );
			clearTimeout( checkIntentTimeout );

			$e.uiStates.remove( 'document/scrubbing-mode' );
			this.setInactive( [ input ] );
		}, { once: true } );
	}

	onMouseDownLabel( e ) {
		const label = e.target;
		const input = e.target.control;

		if ( ! this.isInputValidForScrubbing( input ) ) {
			return;
		}

		$e.uiStates.set( 'document/scrubbing-mode', ScrubbingMode.ON );
		this.setActive( [ input, label ] );

		const trackMovement = ( movementEvent ) => {
			this.scrub( input, movementEvent );
		};

		document.addEventListener( 'mousemove', trackMovement );

		document.addEventListener( 'mouseup', () => {
			document.removeEventListener( 'mousemove', trackMovement );

			$e.uiStates.remove( 'document/scrubbing-mode' );
			this.setInactive( [ input, label ] );
		}, { once: true } );
	}

	onMouseEnterLabel( e ) {
		const input = e.target.control;

		if ( ! this.isInputValidForScrubbing( input ) ) {
			return;
		}

		e.target.classList.add( this.scrubSettings.scrubbingOverClass );
	}

	onMouseLeaveLabel( e ) {
		const input = e.target.control;

		if ( ! this.isInputValidForScrubbing( input ) ) {
			return;
		}

		e.target.classList.remove( this.scrubSettings.scrubbingOverClass );
	}
}
