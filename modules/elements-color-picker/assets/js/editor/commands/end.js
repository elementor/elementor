import CommandBase from 'elementor-api/modules/command-base';

export class End extends CommandBase {
	apply() {
		// Remove all elements & event listeners.
		elementor.$previewContents.find( 'body' ).removeClass( 'elementor-editor__ui-state__color-picker' );

		elementor.$previewContents.find( '.e-element-color-picker' ).remove();

		elementor.$previewContents.off( 'click.color-picker' );

		elementor.$previewWrapper.off( 'mouseleave.color-picker' );

		// Reset the current picker.
		this.component.currentPicker = {
			container: null,
			control: null,
			initialColor: null,
		};
	}
}
