import { Sources } from 'elementor-editor/editor-constants';

export class Exit extends $e.modules.CommandBase {
	apply() {
		$e.route( 'panel/menu', {}, { source: Sources.PANEL } );
	}
}

export default Exit;
