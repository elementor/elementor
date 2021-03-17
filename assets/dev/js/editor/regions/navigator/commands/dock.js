import CommandBase from 'elementor-api/modules/command-base';

export class Dock extends CommandBase {
	apply() {
		if ( elementor.navigator.isDocked ) {
			return false;
		}

		// TODO: Move to UI hook.
		elementorCommon.elements.$body.addClass( 'elementor-navigator-docked' );

		const side = elementorCommon.config.isRTL ? 'left' : 'right',
			resizableOptions = elementor.navigator.getResizableOptions();

		elementor.navigator.$el.css( {
			height: '',
			top: '',
			bottom: '',
			left: '',
			right: '',
		} );

		elementor.$previewWrapper.css( side, elementor.navigator.storage.size.width );

		resizableOptions.handles = elementorCommon.config.isRTL ? 'e' : 'w';

		resizableOptions.resize = ( event, ui ) => {
			elementor.$previewWrapper.css( side, ui.size.width );
		};

		elementor.navigator.$el.resizable( resizableOptions );

		elementor.navigator.isDocked = true;

		elementor.navigator.saveStorage( 'docked', true );

		return true;
	}
}

export default Dock;
