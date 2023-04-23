import CommandBase from 'elementor-api/modules/command-base';

export class Toggle extends CommandBase {
	apply() {
		if ( this.component.isOpen ) {
			this.component.close();
		} else {
			$e.route( this.component.getNamespace() );
		}
	}
}

export default Toggle;
