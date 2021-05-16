import Command from 'elementor-api/modules/command';

export class EnterPreview extends Command {
	apply( args ) {
		// Silent
		this.component.currentPicker.container.settings.set( this.component.currentPicker.control, args.value );
		this.component.currentPicker.container.view.renderUI();
	}
}
