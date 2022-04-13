const SCRUB_REGULAR = 'UPDATE-VALUE';
const SCRUB_ENHANCED = 'UPDATE-VALUE-ENHANCED';
const SKIP_SCRUB = 'SKIP-UPDATE-VALUE';

module.exports = class Scrubbing extends Marionette.Behavior {
	getSetting( settingKey ) {
		const propertyObject = this.getOption( 'scrubSettings' ) || {};

		return propertyObject[ settingKey ];
	}

	intentVerified = false;

	checkIntentTimeout = null;

	skipperCount = 0;

	intentTime = this.getSetting( 'intentTime' ) ?? 600;

	skipperMax = this.getSetting( 'skipperMax' ) ?? 10;

	enhancedNumber = this.getSetting( 'enhancedNumber' ) ?? 10;

	scrubbingClass = this.getSetting( 'scrubbingClass' ) ?? 'e-scrubbing';

	scrubbingElementClass = this.getSetting( 'scrubbingElementClass' ) ?? 'e-scrubbing-element';

	scrubbingOverClass = this.getSetting( 'scrubbingOverClass' ) ?? 'e-scrubbing-over';

	ui() {
		return {
			input: 'input',
			label: 'label',
		};
	}

	events() {
		return {
			'mousedown @ui.input': 'onMouseDownInput',
			'mousedown @ui.label': 'onMouseDownLabel',
			'mouseenter  @ui.label': 'onMouseEnterLabel',
		};
	}

	scrub( input, movementEvent ) {
		// Determine the updating rhythm.
		const movementType = this.getMovementType( movementEvent );

		if ( SKIP_SCRUB === movementType ) {
			return;
		}

		// Actually change the input by scrubbing.
		switch ( movementType ) {
			case SCRUB_REGULAR:
				input.value = +input.value + movementEvent.movementX;
				break;

			case SCRUB_ENHANCED:
				input.value = +input.value + ( movementEvent.movementX * this.enhancedNumber );
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
			if ( this.skipperCount <= this.skipperMax ) {
				return SKIP_SCRUB;
			}

			// Skipped x time, now (update value &) restart counting.
			this.skipperCount = 0;

			return SCRUB_REGULAR;
		}

		if ( movementEvent.ctrlKey ) {
			// When CTRL key is pressed, updating input value In an improved way.
			return SCRUB_ENHANCED;
		}

		return SCRUB_REGULAR;
	}

	onMouseDownInput( e ) {
		const input = e.target;

		if ( this.checkInputDisabled( input ) ) {
			return;
		}

		const trackMovement = ( movementEvent ) => {
			if ( this.intentVerified ) {
				this.scrub( input, movementEvent );
			}
		};

		document.addEventListener( 'mousemove', trackMovement );

		clearTimeout( this.checkIntentTimeout );
		this.intentVerified = false;

		// For input, scrubbing effect works only after X time the mouse is down.
		this.checkIntentTimeout = setTimeout( () => {
			this.intentVerified = true;

			document.body.classList.add( this.scrubbingClass );
			input.classList.add( this.scrubbingElementClass );
		}, this.intentTime );

		document.addEventListener( 'mouseup', () => {
				document.removeEventListener( 'mousemove', trackMovement );
				clearTimeout( this.checkIntentTimeout );
				this.intentVerified = false;

				document.body.classList.remove( this.scrubbingClass );
				input.classList.remove( this.scrubbingElementClass );
			},
			{ once: true }
		);
	}

	onMouseDownLabel( e ) {
		const label = e.target;
		const input = e.target.control;

		if ( this.checkInputDisabled( input ) ) {
			return;
		}

		document.body.classList.add( this.scrubbingClass );
		label.classList.add( this.scrubbingElementClass );
		input.classList.add( this.scrubbingElementClass );

		const trackMovement = ( movementEvent ) => {
			this.scrub( input, movementEvent );
		};

		document.addEventListener( 'mousemove', trackMovement );

		document.addEventListener( 'mouseup', () => {
				document.removeEventListener( 'mousemove', trackMovement );
				document.body.classList.remove( this.scrubbingClass );
				label.classList.remove( this.scrubbingElementClass );
				input.classList.remove( this.scrubbingElementClass );
			},
			{ once: true }
		);
	}

	onMouseEnterLabel( e ) {
		if ( this.checkInputDisabled( e.target.control ) ) {
			return;
		}

		e.target.classList.add( this.scrubbingOverClass );
	}

	checkInputDisabled( input ) {
		if ( input.disabled ) {
			return true;
		}
	}
};
