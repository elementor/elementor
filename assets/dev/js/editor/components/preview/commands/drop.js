export class Drop extends $e.modules.CommandBase {
	apply( args = {} ) {
		return elementor.getPreviewContainer().view.createElementFromModel( args, args.options || {} );
	}
}
