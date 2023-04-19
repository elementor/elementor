import { Sources } from 'elementor-editor/editor-constants';

export class Open extends $e.modules.CommandBase {
	apply() {
		$e.route( this.component.getNamespace(), {}, {
			source: Sources.NAVIGATOR,
		} );
	}
}

export default Open;
