export class Open extends $e.modules.CommandBase {
	apply() {
		$e.route( this.component.getNamespace(), {}, {
			source: 'navigator',
		} );
	}
}

export default Open;
