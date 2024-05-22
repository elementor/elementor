export class Enable extends $e.modules.CommandBase {
	apply( args ) {
		$e.components.get( 'preview/styleguide' ).enableStyleguidePreview( args );
	}
}

export default Enable;
