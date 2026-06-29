export class Open extends $e.modules.CommandBase {
	apply( args ) {
		$e.route( this.component.getNamespace(), args );
	}
}

export default Open;
