export class Drop extends $e.modules.CommandBase {
	apply( args = {} ) {
		elementor.getPreviewContainer().view.createElementFromModel( args );
	}
}
