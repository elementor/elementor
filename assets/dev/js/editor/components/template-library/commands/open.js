import CommandBase from 'elementor-api/modules/command-base';

export class Open extends CommandBase {
	apply( args ) {
		return this.component.show( args );
	}
}

export default Open;
