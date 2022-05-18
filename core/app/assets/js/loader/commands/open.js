export class Open extends $e.modules.CommandBase {
	apply( args ) {
		$e.route( 'app', args, { source: 'app' } );

		return true;
	}
}

export default Open;
