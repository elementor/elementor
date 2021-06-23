import Command from 'elementor-api/modules/command';

export class ExitPreview extends Command {
	apply( args ) {
		const { initialColor } = this.component.currentPicker;

		if ( null === initialColor ) {
			return;
		}

		this.component.renderUI( initialColor );
	}
}
