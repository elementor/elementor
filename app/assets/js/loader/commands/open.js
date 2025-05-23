export class Open extends $e.modules.CommandBase {
	apply( args ) {
		$e.route( 'app', args );

		return true;
	}
}

export default Open;
