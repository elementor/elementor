// TODO: Test the example.
class ExampleCommand extends $e.modules.CommandBase {
	apply( args ) {
		// Output command args to console.
		console.log( args );

		// Return object as example.
		return {
			example: 'whatever you wish',
		};
	}
}

class CustomComponent extends elementorModules.common.Component {
	getNamespace() {
		return 'custom-component';
	}

	defaultCommands() {
		// Object of all the component commands.
		return {
			example: ( args ) => ( new ExampleCommand( args ) ).run(),
		};
	}
}

elementorCommon.elements.$window.on( 'elementor:init', () => {
	// Register the new component.
	$e.components.register( new CustomComponent() );

	setTimeout( () => {
		// Run's 'example' command from 'custom-component'.
		const result = $e.run( 'custom-component/example', {
			property: 'value',
		} );

		// Output command run result.
		console.log( 'result: ', result );
	} );
} );
