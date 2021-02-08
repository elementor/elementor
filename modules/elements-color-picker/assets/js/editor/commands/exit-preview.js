import CommandBase from 'elementor-api/modules/command-base';

export class ExitPreview extends CommandBase {
	apply( args ) {
		if ( ! this.component.currentPicker.initialColor ) {
			return;
		}

		this.component.currentPicker.container.settings.set( this.component.currentPicker.control, this.component.currentPicker.initialColor );
		this.component.currentPicker.container.render();
	}
}
