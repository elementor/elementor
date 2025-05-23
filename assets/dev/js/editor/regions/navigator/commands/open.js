export class Open extends $e.modules.CommandBase {
	apply() {
		$e.route( this.component.getNamespace() );
	}
}

export default Open;
