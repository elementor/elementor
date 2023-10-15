export class SwitcherChange extends $e.modules.CommandBase {
	validateArgs( args = {} ) {
		this.requireArgumentType( 'name', 'string', args );
		this.requireArgumentType( 'value', 'string', args );
	}

	apply( args ) {
		if ( args.name.includes( 'enable_styleguide_preview' ) ) {
			$e.components.get( 'preview/styleguide' ).enableStyleguidePreview( { value: args.value } );
		}
	}
}

export default SwitcherChange;
