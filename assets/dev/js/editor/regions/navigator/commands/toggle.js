import CommandBase from 'elementor-api/modules/command-base';

export class Toggle extends CommandBase {
	apply() {
		if ( this.component.isOpen ) {
			$e.run( 'navigator/close' );
		} else {
			$e.run( 'navigator/open' );
		}
	}
}

export default Toggle;
