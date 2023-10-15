export class Hide extends $e.modules.CommandBase {
	apply() {
		$e.components.get( 'preview/styleguide' ).hideStyleguidePreview();
	}
}

export default Hide;
