// TODO: Test the example.
class CustomCommand extends $e.modules.CommandBase {
	apply( args ) {
		console.log( args );

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
		return {
			example: ( args ) => ( new CustomCommand( args ) ).run(),
		};
	}
}

elementorCommon.elements.$window.on( 'elementor:init', () => {
	$e.components.register( new CustomComponent() );

	setTimeout( () => {
		const result = $e.run( 'custom-component/example', {
			property: 'value',
		} );

		console.log( 'result: ', result );
	} );
} );
