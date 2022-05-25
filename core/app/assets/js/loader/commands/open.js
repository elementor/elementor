import { Sources } from 'elementor-editor/editor-constants';

export class Open extends $e.modules.CommandBase {
	apply( args ) {
		$e.route( 'app', args, { source: Sources.APP } );

		return true;
	}
}

export default Open;
