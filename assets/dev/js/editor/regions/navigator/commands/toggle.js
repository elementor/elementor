import Command from 'elementor-api/modules/command';

export class Toggle extends Command {
	apply() {
		if ( this.component.isOpen ) {
			$e.run( 'navigator/close' );
		} else {
			$e.run( 'navigator/open' );
		}
	}
}

export default Toggle;
