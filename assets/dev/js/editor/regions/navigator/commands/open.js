export class Open extends $e.modules.CommandBase {
	apply( args ) {
		$e.route( this.component.getNamespace() );
		this.component.open( args );
	}
}

export default Open;
