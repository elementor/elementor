// TODO: Test the example.
class ExampleCommand extends $e.modules.CommandBase {
	apply( args ) {
		// Output command args to console.
		console.log( 'ExampleCommand: ', args );

		// Return object as example.
		return {
			example: 'result from ExampleCommand',
		};
	}
}

class CustomComponent extends $e.modules.Component {
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

// Register the new component.
$e.components.register( new CustomComponent() );

// Run's 'example' command from 'custom-component'.
result = $e.run( 'custom-component/example', {
	property: 'value',
} );

// Output command run result.
console.log( 'e-components-eg-1-result: ', result );
