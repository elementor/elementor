export class Toggle extends $e.modules.CommandBase {
	apply() {
		if ( this.component.isOpen ) {
			$e.run( 'navigator/close' );
		} else {
			$e.run( 'navigator/open' );
		}
	}
}

export default Toggle;
