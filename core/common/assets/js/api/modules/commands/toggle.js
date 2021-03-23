import Command from 'elementor-api/modules/command';

export class Toggle extends Command {
	apply() {
		if ( this.component.isOpen ) {
			this.component.close();
		} else {
			$e.route( this.component.getNamespace() );
		}
	}
}

export default Toggle;
