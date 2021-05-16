import Command from 'elementor-api/modules/command';

export class ExitPreview extends Command {
	apply( args ) {
		if ( null === this.component.currentPicker.initialColor ) {
			return;
		}

		// Silent
		this.component.currentPicker.container.settings.set( this.component.currentPicker.control, this.component.currentPicker.initialColor );
		this.component.currentPicker.container.view.renderUI();
	}
}
