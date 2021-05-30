import CommandBase from 'elementor-api/modules/command-base';

export class EnterPreview extends CommandBase {
	apply( args ) {
		// Silent.
		this.component.renderUI( args.value );
	}
}
