export default class BaseOpenClose extends $e.modules.hookUI.After {
	initialize() {
		elementor.on( 'preview:loaded', () => {
			this.component = $e.components.get( 'panel/global' );
		} );
	}
}
