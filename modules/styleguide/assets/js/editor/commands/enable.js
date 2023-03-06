export class Enable extends $e.modules.CommandBase {
	apply() {
		$e.components.get( 'preview/styleguide' ).enableStyleguidePreview();
	}
}

export default Enable;
