import CommandBase from 'elementor-api/modules/command-base';

export class End extends CommandBase {
	apply() {
		elementor.$previewContents.find( 'body' ).removeClass( 'elementor-editor__ui-state__color-picker' );

		elementor.$previewContents.find( '.elementor-element-color-picker' ).remove();

		elementor.$previewContents.off( 'mouseenter.color-picker' );

		elementor.$previewWrapper.off( 'mouseleave.color-picker' );

		this.component.currentPicker = {
			container: null,
			control: null,
			initialColor: null,
		};
	}
}
