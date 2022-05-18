export class Exit extends $e.modules.CommandBase {
	apply() {
		$e.route( 'panel/menu', {}, { source: 'panel' } );
	}
}

export default Exit;
