import Command from 'elementor-api/modules/command';

export class EnterPreview extends Command {
	apply( args ) {
		this.component.renderUI( args.value );
	}
}
