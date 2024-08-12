/**
 * @typedef {import('elementor/assets/dev/js/editor/container/container')} Container
 */
export class StylesUpdated extends $e.modules.editor.CommandContainerBase {
	validateArgs( args ) {
		this.requireContainer( args );
	}

	apply( args ) {}
}

export default StylesUpdated;
