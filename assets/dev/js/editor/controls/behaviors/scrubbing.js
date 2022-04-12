const UPDATE_VALUE = 'UPDATE-VALUE';
const UPDATE_VALUE_ENHANCED = 'UPDATE-VALUE-ENHANCED';

module.exports = class FooterSaver extends Marionette.Behavior {
	intentVerified = false;

	checkIntentTimeout = null;

	intentTime = 600;

	skipperCount = 0;

	skipperMax = 10;

	enhancedNumber = 10;

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
			'mouseover @ui.label': 'onMouseOverLabel',
		};
	}

	scrub( input, movementEvent ) {
		// Determine the updating rhythm.
		const movementType = this.checkKeyDown( movementEvent );

		if ( ! movementType ) {
			return;
		}

		// Actually change the input by scrubbing.
		switch ( movementType ) {
			case UPDATE_VALUE:
				input.value = +input.value + movementEvent.movementX;
				break;

			case UPDATE_VALUE_ENHANCED:
				input.value = +input.value + ( movementEvent.movementX * this.enhancedNumber );
				break;

			default:
				break;
		}

		// Fire inputEvent after changing input data, for validation purposes.
		input.dispatchEvent( new Event( 'input', { bubbles: true } ) );
	}

	checkKeyDown( movementEvent ) {
		if ( movementEvent.altKey && ! movementEvent.ctrlKey ) {
			this.skipperCount++;
			// When ALT key is pressed, skipping x times before updating input value.
			if ( this.skipperCount <= this.skipperMax ) {
				return;
			}
			// Skipped x time, now (update value &) restart counting.
			this.skipperCount = 0;
		} else if ( movementEvent.ctrlKey && ! movementEvent.altKey ) {
			// When CTRL key is pressed, updating input value In an improved way.
			return UPDATE_VALUE_ENHANCED;
		}

		return UPDATE_VALUE;
	}

	onMouseDownInput( e ) {
		const input = e.target;

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
			document.body.classList.add( 'e-scrubbing' );
			input.classList.add( 'e-scrubbing-element' );
		}, this.intentTime );

		document.addEventListener( 'mouseup', () => {
				document.removeEventListener( 'mousemove', trackMovement );
				clearTimeout( this.checkIntentTimeout );
				this.intentVerified = false;
				document.body.classList.remove( 'e-scrubbing' );
				input.classList.remove( 'e-scrubbing-element' );
			},
			{ once: true }
		);
	}

	onMouseDownLabel( e ) {
		const label = e.target;
		const input = e.target.control;

		document.body.classList.add( 'e-scrubbing' );
		label.classList.add( 'e-scrubbing-element' );
		input.classList.add( 'e-scrubbing-element' );

		const trackMovement = ( movementEvent ) => {
			this.scrub( input, movementEvent );
		};

		document.addEventListener( 'mousemove', trackMovement );

		document.addEventListener( 'mouseup', () => {
				document.removeEventListener( 'mousemove', trackMovement );
				document.body.classList.remove( 'e-scrubbing' );
				label.classList.remove( 'e-scrubbing-element' );
				input.classList.remove( 'e-scrubbing-element' );
			},
			{ once: true }
		);
	}

	onMouseOverLabel( e ) {
		e.target.classList.add( 'e-scrubbing-over' );
	}
};
