import { SOURCES } from 'elementor-editor/editor-constants';

export class Exit extends $e.modules.CommandBase {
	apply() {
		$e.route( 'panel/menu', {}, { source: SOURCES.PANEL } );
	}
}

export default Exit;
