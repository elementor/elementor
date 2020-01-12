import CommandBase from 'elementor-api/modules/command-base';

export class Close extends CommandBase {
	apply( args ) {
		if ( ! this.component.close() ) {
			return false;
		}

		this.component.manager.close();

		return true;
	}
}

export default Close;
