// Example of event after the command runs.
class CustomEvent extends $e.modules.EventBase.After {
	getCommand() {
		// Command to listen.
		return 'custom-component/example';
	}

	getId() {
		// Unique id for the event.
		return 'custom-component-example-event';
	}

	getConditions( args ) {
		// Conditions for the event to be applied.
		if ( args.toggleClass ) {
			return true;
		}

		return false;
	}

	/*
	 * The actual event logic.
	 */
	apply( args, result ) {
		console.log( 'My event custom logic', 'args: ', args, 'result: ', result );

		// Add 'custom-component' class for all div elements.
		jQuery.find( 'div' ).forEach( ( $div ) => {
			$div = jQuery( $div );

			$div.addClass( 'custom-component' );
		} );
	}
}

// Add new event to `$e.events`;
const myEvent = new CustomEvent();

// Output new event.
console.log( myEvent );

// Output all events after.
console.log( $e.events.getAll().after );

// Test the event.
result = $e.run( 'custom-component/example', {
	toggleClass: true,
} );

// Output command run result.
console.log( 'e-events-eg-1-result:', result );
