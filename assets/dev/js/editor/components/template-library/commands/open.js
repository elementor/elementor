import Command from 'elementor-api/modules/command';

export class Open extends Command {
	apply( args ) {
		return this.component.show( args );
	}
}

export default Open;
