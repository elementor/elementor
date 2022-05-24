import { SOURCES } from 'elementor-editor/editor-constants';

export class Open extends $e.modules.CommandBase {
	apply( args ) {
		$e.route( 'app', args, { source: SOURCES.APP } );

		return true;
	}
}

export default Open;
